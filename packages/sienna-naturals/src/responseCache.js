import { createClient } from 'redis';
import { createHash } from 'crypto';
import winston from 'winston';

export class ResponseCache {
  constructor(options = {}) {
    this.redis = null;
    this.isConnected = false;
    this.defaultTTL = options.defaultTTL || 86400; // 24 hours in seconds
    this.maxSize = options.maxSize || 1000;
    this.keyPrefix = options.keyPrefix || 'sienna:cache:';
    this.brandSpecific = options.brandSpecific !== false; // default true
    
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      transports: [new winston.transports.Console()]
    });

    // Cache statistics
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
      startTime: Date.now()
    };

    // Initialize Redis connection
    this.initializeRedis(options.redis);
    
    // Cache warming patterns
    this.warmupPatterns = [
      'hair type',
      'curly hair routine',
      'natural hair care',
      'dry hair solutions',
      'hair growth tips',
      'protective styling',
      'deep conditioning',
      'sienna naturals products'
    ];
  }

  async initializeRedis(redisOptions = {}) {
    try {
      const config = {
        socket: {
          host: redisOptions.host || 'localhost',
          port: redisOptions.port || 6379,
          connectTimeout: 10000,
          commandTimeout: 5000
        },
        ...(redisOptions.password && { password: redisOptions.password })
      };

      this.redis = createClient(config);

      // Set up error handling
      this.redis.on('error', (error) => {
        this.logger.error('Redis connection error:', error);
        this.isConnected = false;
        this.stats.errors++;
      });

      this.redis.on('connect', () => {
        this.logger.info('Redis connected successfully');
        this.isConnected = true;
      });

      this.redis.on('disconnect', () => {
        this.logger.warn('Redis disconnected');
        this.isConnected = false;
      });

      this.redis.on('reconnecting', () => {
        this.logger.info('Redis reconnecting...');
      });

      // Connect to Redis
      await this.redis.connect();
      
    } catch (error) {
      this.logger.error('Failed to initialize Redis:', error);
      this.isConnected = false;
    }
  }

  // Generate cache key based on message and context
  generateCacheKey(message, userContext, analysisContext) {
    const keyComponents = [
      this.normalizeMessage(message),
      userContext.userId || 'anonymous',
      analysisContext.conversationType || 'general',
      analysisContext.journeyStage || 'learning',
      JSON.stringify(analysisContext.topics || []),
      this.brandSpecific ? (userContext.brand || 'default') : 'global'
    ];

    // Create hash of key components for consistent, shorter keys
    const keyString = keyComponents.join('|');
    const hash = createHash('sha256').update(keyString).digest('hex').substring(0, 16);
    
    return `${this.keyPrefix}${hash}`;
  }

  // Normalize message for consistent caching
  normalizeMessage(message) {
    return message
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .replace(/\s+/g, ' ')      // Normalize whitespace
      .trim()
      .substring(0, 100);        // Limit length
  }

  // Check if response is cacheable
  isCacheable(message, context, response) {
    // Don't cache very short or very long messages
    if (message.length < 10 || message.length > 1000) {
      return false;
    }

    // Don't cache personal information
    const personalKeywords = [
      'my name', 'i am', 'personal', 'private', 'address', 'phone', 'email'
    ];
    const messageLower = message.toLowerCase();
    if (personalKeywords.some(keyword => messageLower.includes(keyword))) {
      return false;
    }

    // Don't cache urgent requests
    if (context.urgency === 'high') {
      return false;
    }

    // Don't cache image-related responses (they're context-specific)
    if (context.hasImages) {
      return false;
    }

    // Don't cache very low confidence responses
    if (response.confidence && response.confidence < 0.7) {
      return false;
    }

    return true;
  }

  // Get cached response
  async getCachedResponse(message, userContext, analysisContext) {
    if (!this.isConnected) {
      this.stats.misses++;
      return null;
    }

    try {
      const cacheKey = this.generateCacheKey(message, userContext, analysisContext);
      const cachedData = await this.redis.get(cacheKey);

      if (cachedData) {
        this.stats.hits++;
        const parsed = JSON.parse(cachedData);
        
        // Update last accessed time
        await this.redis.expire(cacheKey, this.defaultTTL);
        
        this.logger.debug('Cache hit', {
          cacheKey,
          userId: userContext.userId,
          hitRate: this.getCacheHitRate()
        });

        // Add cache metadata
        parsed.cached = true;
        parsed.cacheKey = cacheKey;
        parsed.cacheTime = new Date().toISOString();
        
        return parsed;
      } else {
        this.stats.misses++;
        this.logger.debug('Cache miss', {
          cacheKey,
          userId: userContext.userId
        });
        return null;
      }
    } catch (error) {
      this.logger.error('Error getting cached response:', error);
      this.stats.errors++;
      this.stats.misses++;
      return null;
    }
  }

  // Cache response
  async cacheResponse(message, userContext, analysisContext, response, customTTL = null) {
    if (!this.isConnected) {
      return false;
    }

    // Check if this response should be cached
    if (!this.isCacheable(message, analysisContext, response)) {
      this.logger.debug('Response not cacheable', {
        userId: userContext.userId,
        messageLength: message.length,
        urgency: analysisContext.urgency,
        confidence: response.confidence
      });
      return false;
    }

    try {
      const cacheKey = this.generateCacheKey(message, userContext, analysisContext);
      const ttl = customTTL || this.defaultTTL;

      // Prepare cache data
      const cacheData = {
        response: response.response,
        model: response.model,
        confidence: response.confidence,
        suggestions: response.suggestions || [],
        timestamp: Date.now(),
        userId: userContext.userId,
        messageHash: this.normalizeMessage(message),
        context: {
          conversationType: analysisContext.conversationType,
          journeyStage: analysisContext.journeyStage,
          complexity: analysisContext.complexity
        }
      };

      await this.redis.setEx(cacheKey, ttl, JSON.stringify(cacheData));
      this.stats.sets++;

      this.logger.debug('Response cached', {
        cacheKey,
        userId: userContext.userId,
        ttl,
        responseLength: response.response.length
      });

      // Maintain cache size limit
      await this.maintainCacheSize();

      return true;
    } catch (error) {
      this.logger.error('Error caching response:', error);
      this.stats.errors++;
      return false;
    }
  }

  // Pre-warm cache with common queries
  async warmupCache(commonQueries = null) {
    if (!this.isConnected) {
      return;
    }

    const queries = commonQueries || this.warmupPatterns;
    this.logger.info('Starting cache warmup', { queryCount: queries.length });

    try {
      for (const query of queries) {
        // Create basic context for warmup
        const userContext = {
          userId: 'warmup',
          brand: 'Sienna Naturals'
        };
        
        const analysisContext = {
          conversationType: 'general',
          journeyStage: 'learning',
          complexity: 'medium',
          topics: [{ category: 'general', keywords: [query] }],
          urgency: 'normal',
          hasImages: false
        };

        // Check if already cached
        const existing = await this.getCachedResponse(query, userContext, analysisContext);
        if (!existing) {
          // This would typically be filled by actual AI responses during normal operation
          // For warmup, we're just creating the cache structure
          this.logger.debug('Warmup query not cached yet', { query });
        }
      }
    } catch (error) {
      this.logger.error('Error during cache warmup:', error);
    }
  }

  // Maintain cache size within limits
  async maintainCacheSize() {
    if (!this.isConnected) {
      return;
    }

    try {
      const keys = await this.redis.keys(`${this.keyPrefix}*`);
      
      if (keys.length > this.maxSize) {
        // Remove oldest entries (simple LRU approximation)
        const excessCount = keys.length - this.maxSize;
        const keysToRemove = keys.slice(0, excessCount);
        
        if (keysToRemove.length > 0) {
          await this.redis.del(keysToRemove);
          this.stats.deletes += keysToRemove.length;
          
          this.logger.info('Cache maintenance completed', {
            removedKeys: keysToRemove.length,
            remainingKeys: keys.length - keysToRemove.length
          });
        }
      }
    } catch (error) {
      this.logger.error('Error maintaining cache size:', error);
      this.stats.errors++;
    }
  }

  // Get cache statistics
  getCacheStats() {
    const uptime = Date.now() - this.stats.startTime;
    const hitRate = this.getCacheHitRate();
    
    return {
      ...this.stats,
      hitRate,
      missRate: 100 - hitRate,
      uptime,
      isConnected: this.isConnected,
      defaultTTL: this.defaultTTL,
      maxSize: this.maxSize
    };
  }

  getCacheHitRate() {
    const totalRequests = this.stats.hits + this.stats.misses;
    return totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
  }

  // Advanced cache operations
  
  // Invalidate cache entries matching pattern
  async invalidatePattern(pattern) {
    if (!this.isConnected) {
      return 0;
    }

    try {
      const keys = await this.redis.keys(`${this.keyPrefix}*${pattern}*`);
      if (keys.length > 0) {
        const deleted = await this.redis.del(keys);
        this.stats.deletes += deleted;
        
        this.logger.info('Cache invalidation completed', {
          pattern,
          deletedKeys: deleted
        });
        
        return deleted;
      }
      return 0;
    } catch (error) {
      this.logger.error('Error invalidating cache pattern:', error);
      this.stats.errors++;
      return 0;
    }
  }

  // Invalidate user-specific cache
  async invalidateUserCache(userId) {
    return await this.invalidatePattern(userId);
  }

  // Get cache entries for analysis
  async getCacheEntries(limit = 100) {
    if (!this.isConnected) {
      return [];
    }

    try {
      const keys = await this.redis.keys(`${this.keyPrefix}*`);
      const limitedKeys = keys.slice(0, limit);
      
      const entries = [];
      for (const key of limitedKeys) {
        try {
          const data = await this.redis.get(key);
          const ttl = await this.redis.ttl(key);
          
          if (data) {
            const parsed = JSON.parse(data);
            entries.push({
              key,
              ttl,
              timestamp: parsed.timestamp,
              userId: parsed.userId,
              messageHash: parsed.messageHash,
              context: parsed.context,
              age: Date.now() - parsed.timestamp
            });
          }
        } catch (error) {
          this.logger.warn('Error reading cache entry:', { key, error: error.message });
        }
      }
      
      return entries.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      this.logger.error('Error getting cache entries:', error);
      return [];
    }
  }

  // Cache optimization analysis
  async analyzeCachePerformance() {
    const stats = this.getCacheStats();
    const entries = await this.getCacheEntries(500);
    
    const analysis = {
      performance: {
        hitRate: stats.hitRate,
        totalRequests: stats.hits + stats.misses,
        averageResponseTime: 'N/A', // Would need to be tracked separately
        errorRate: (stats.errors / (stats.hits + stats.misses + stats.errors)) * 100
      },
      usage: {
        totalEntries: entries.length,
        oldestEntry: entries.length > 0 ? new Date(Math.min(...entries.map(e => e.timestamp))) : null,
        newestEntry: entries.length > 0 ? new Date(Math.max(...entries.map(e => e.timestamp))) : null,
        averageAge: entries.length > 0 ? entries.reduce((sum, e) => sum + e.age, 0) / entries.length : 0
      },
      patterns: {
        topUsers: this.getTopUsers(entries),
        topContextTypes: this.getTopContextTypes(entries),
        expirationDistribution: this.getExpirationDistribution(entries)
      },
      recommendations: this.generateOptimizationRecommendations(stats, entries)
    };

    return analysis;
  }

  getTopUsers(entries, limit = 10) {
    const userCounts = {};
    entries.forEach(entry => {
      if (entry.userId && entry.userId !== 'warmup') {
        userCounts[entry.userId] = (userCounts[entry.userId] || 0) + 1;
      }
    });
    
    return Object.entries(userCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([userId, count]) => ({ userId, count }));
  }

  getTopContextTypes(entries) {
    const contextCounts = {};
    entries.forEach(entry => {
      if (entry.context && entry.context.conversationType) {
        const type = entry.context.conversationType;
        contextCounts[type] = (contextCounts[type] || 0) + 1;
      }
    });
    
    return Object.entries(contextCounts)
      .sort(([,a], [,b]) => b - a)
      .map(([type, count]) => ({ type, count }));
  }

  getExpirationDistribution(entries) {
    const now = Date.now();
    const distribution = {
      expiringSoon: 0, // < 1 hour
      expiringSometime: 0, // 1-6 hours
      expiringLater: 0 // > 6 hours
    };

    entries.forEach(entry => {
      if (entry.ttl > 0) {
        const timeToExpire = entry.ttl * 1000; // Convert to milliseconds
        if (timeToExpire < 3600000) { // 1 hour
          distribution.expiringSoon++;
        } else if (timeToExpire < 21600000) { // 6 hours
          distribution.expiringSometime++;
        } else {
          distribution.expiringLater++;
        }
      }
    });

    return distribution;
  }

  generateOptimizationRecommendations(stats, entries) {
    const recommendations = [];

    // Hit rate recommendations
    if (stats.hitRate < 30) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        message: 'Cache hit rate is low. Consider increasing TTL or improving cache key generation.'
      });
    }

    // Error rate recommendations
    const errorRate = (stats.errors / (stats.hits + stats.misses + stats.errors)) * 100;
    if (errorRate > 5) {
      recommendations.push({
        type: 'reliability',
        priority: 'high',
        message: 'High error rate detected. Check Redis connection and configuration.'
      });
    }

    // Size recommendations
    if (entries.length > this.maxSize * 0.8) {
      recommendations.push({
        type: 'capacity',
        priority: 'medium',
        message: 'Cache is near capacity. Consider increasing maxSize or reducing TTL.'
      });
    }

    return recommendations;
  }

  // Cleanup and disconnection
  async disconnect() {
    if (this.redis && this.isConnected) {
      try {
        await this.redis.quit();
        this.isConnected = false;
        this.logger.info('Redis connection closed gracefully');
      } catch (error) {
        this.logger.error('Error closing Redis connection:', error);
      }
    }
  }

  // Health check
  isHealthy() {
    return this.isConnected && this.getCacheHitRate() > 20; // At least 20% hit rate
  }
}