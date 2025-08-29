import winston from 'winston';
import { EventEmitter } from 'events';

export class AnalyticsTracker extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.database = options.database;
    this.batchSize = options.batchSize || 100;
    this.flushInterval = options.flushInterval || 30000; // 30 seconds
    this.maxRetries = options.maxRetries || 3;
    
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      transports: [new winston.transports.Console()]
    });

    // Event batching for performance
    this.eventQueue = [];
    this.conversationQueue = [];
    this.errorQueue = [];
    this.metricsQueue = [];

    // Real-time metrics
    this.realTimeMetrics = {
      activeConversations: new Set(),
      totalConversations: 0,
      totalMessages: 0,
      totalErrors: 0,
      modelUsage: {},
      responseTimeSum: 0,
      responseTimeCount: 0,
      cacheHits: 0,
      cacheMisses: 0,
      startTime: Date.now()
    };

    // Start batch processing
    this.flushTimer = setInterval(() => {
      this.flushBatches();
    }, this.flushInterval);

    // Journey tracking
    this.hairJourneyStages = [
      'discovery', 'transition', 'learning', 'experimentation',
      'stabilization', 'optimization', 'maintenance', 'mastery'
    ];
  }

  // Core tracking methods

  async trackConversation(data) {
    const conversationEvent = {
      userId: data.userId,
      requestId: data.requestId,
      model: data.model,
      responseTime: data.responseTime,
      context: data.context,
      hasImage: data.hasImage || false,
      cached: data.cached || false,
      timestamp: new Date(),
      brand: data.brand || 'Sienna Naturals'
    };

    this.conversationQueue.push(conversationEvent);
    
    // Update real-time metrics
    this.realTimeMetrics.totalConversations++;
    this.realTimeMetrics.totalMessages++;
    this.realTimeMetrics.activeConversations.add(data.userId);
    
    if (data.model) {
      this.realTimeMetrics.modelUsage[data.model] = 
        (this.realTimeMetrics.modelUsage[data.model] || 0) + 1;
    }
    
    if (data.responseTime) {
      this.realTimeMetrics.responseTimeSum += data.responseTime;
      this.realTimeMetrics.responseTimeCount++;
    }

    if (data.cached) {
      this.realTimeMetrics.cacheHits++;
    } else {
      this.realTimeMetrics.cacheMisses++;
    }

    // Emit event for real-time listeners
    this.emit('conversation', conversationEvent);
    
    // Check if batch is full
    if (this.conversationQueue.length >= this.batchSize) {
      await this.flushConversations();
    }
  }

  async trackEvent(eventType, data) {
    const event = {
      eventType,
      userId: data.userId,
      requestId: data.requestId,
      data: JSON.stringify(data),
      timestamp: new Date(),
      brand: data.brand || 'Sienna Naturals'
    };

    this.eventQueue.push(event);
    
    // Update specific metrics based on event type
    switch (eventType) {
      case 'cache_hit':
        this.realTimeMetrics.cacheHits++;
        break;
      case 'cache_miss':
        this.realTimeMetrics.cacheMisses++;
        break;
      case 'user_journey_stage':
        // Track hair journey progression
        await this.trackHairJourneyStage(data.userId, data.stage, data.previousStage);
        break;
      case 'product_recommendation':
        await this.trackProductRecommendation(data);
        break;
      case 'engagement_event':
        await this.trackEngagementEvent(data);
        break;
    }

    this.emit('event', event);
    
    if (this.eventQueue.length >= this.batchSize) {
      await this.flushEvents();
    }
  }

  async trackError(data) {
    const errorEvent = {
      requestId: data.requestId,
      errorType: data.errorType || 'unknown',
      errorMessage: data.error || data.errorMessage,
      model: data.model,
      userId: data.userId,
      responseTime: data.responseTime,
      stackTrace: data.stack,
      timestamp: new Date(),
      brand: data.brand || 'Sienna Naturals'
    };

    this.errorQueue.push(errorEvent);
    this.realTimeMetrics.totalErrors++;

    this.emit('error', errorEvent);
    
    if (this.errorQueue.length >= this.batchSize) {
      await this.flushErrors();
    }
  }

  async trackHairJourneyStage(userId, newStage, previousStage = null) {
    if (!this.database) return;

    try {
      await this.database.upsertUserJourneyStage(userId, newStage, previousStage);
      
      const journeyEvent = {
        eventType: 'hair_journey_progression',
        userId,
        data: JSON.stringify({
          newStage,
          previousStage,
          stageIndex: this.hairJourneyStages.indexOf(newStage),
          progression: previousStage ? 
            this.hairJourneyStages.indexOf(newStage) - this.hairJourneyStages.indexOf(previousStage) : 0
        }),
        timestamp: new Date(),
        brand: 'Sienna Naturals'
      };

      this.eventQueue.push(journeyEvent);
      
    } catch (error) {
      this.logger.error('Error tracking hair journey stage:', error);
    }
  }

  async trackProductRecommendation(data) {
    const recommendationEvent = {
      eventType: 'product_recommendation',
      userId: data.userId,
      data: JSON.stringify({
        productId: data.productId,
        productName: data.productName,
        recommendationReason: data.reason,
        context: data.context,
        userHairType: data.userHairType,
        confidence: data.confidence
      }),
      timestamp: new Date(),
      brand: 'Sienna Naturals'
    };

    this.eventQueue.push(recommendationEvent);
  }

  async trackEngagementEvent(data) {
    const engagementEvent = {
      eventType: 'user_engagement',
      userId: data.userId,
      data: JSON.stringify({
        engagementType: data.type, // scroll, click, time_spent, etc.
        duration: data.duration,
        page: data.page,
        action: data.action,
        value: data.value
      }),
      timestamp: new Date(),
      brand: 'Sienna Naturals'
    };

    this.eventQueue.push(engagementEvent);
  }

  // Batch processing methods

  async flushBatches() {
    try {
      await Promise.allSettled([
        this.flushConversations(),
        this.flushEvents(),
        this.flushErrors(),
        this.flushMetrics()
      ]);
    } catch (error) {
      this.logger.error('Error flushing batches:', error);
    }
  }

  async flushConversations() {
    if (this.conversationQueue.length === 0 || !this.database) return;

    const batch = this.conversationQueue.splice(0, this.batchSize);
    
    try {
      await this.database.insertConversationsBatch(batch);
      this.logger.debug(`Flushed ${batch.length} conversation events`);
    } catch (error) {
      this.logger.error('Error flushing conversations:', error);
      // Re-add failed batch to queue for retry
      this.conversationQueue.unshift(...batch);
    }
  }

  async flushEvents() {
    if (this.eventQueue.length === 0 || !this.database) return;

    const batch = this.eventQueue.splice(0, this.batchSize);
    
    try {
      await this.database.insertEventsBatch(batch);
      this.logger.debug(`Flushed ${batch.length} analytics events`);
    } catch (error) {
      this.logger.error('Error flushing events:', error);
      this.eventQueue.unshift(...batch);
    }
  }

  async flushErrors() {
    if (this.errorQueue.length === 0 || !this.database) return;

    const batch = this.errorQueue.splice(0, this.batchSize);
    
    try {
      await this.database.insertErrorsBatch(batch);
      this.logger.debug(`Flushed ${batch.length} error events`);
    } catch (error) {
      this.logger.error('Error flushing errors:', error);
      this.errorQueue.unshift(...batch);
    }
  }

  async flushMetrics() {
    if (!this.database) return;

    try {
      const metrics = this.getCurrentMetrics();
      await this.database.updateRealTimeMetrics(metrics);
    } catch (error) {
      this.logger.error('Error flushing metrics:', error);
    }
  }

  // Analytics and reporting methods

  getCurrentMetrics() {
    const uptime = Date.now() - this.realTimeMetrics.startTime;
    const avgResponseTime = this.realTimeMetrics.responseTimeCount > 0 
      ? this.realTimeMetrics.responseTimeSum / this.realTimeMetrics.responseTimeCount 
      : 0;

    const cacheTotal = this.realTimeMetrics.cacheHits + this.realTimeMetrics.cacheMisses;
    const cacheHitRate = cacheTotal > 0 
      ? (this.realTimeMetrics.cacheHits / cacheTotal) * 100 
      : 0;

    return {
      activeUsers: this.realTimeMetrics.activeConversations.size,
      totalConversations: this.realTimeMetrics.totalConversations,
      totalMessages: this.realTimeMetrics.totalMessages,
      totalErrors: this.realTimeMetrics.totalErrors,
      averageResponseTime: Math.round(avgResponseTime),
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      modelUsage: this.realTimeMetrics.modelUsage,
      uptime,
      timestamp: new Date()
    };
  }

  async getDashboardMetrics(timeRange = '24h') {
    if (!this.database) {
      return this.getCurrentMetrics();
    }

    try {
      const [
        conversationMetrics,
        modelPerformance,
        userJourneyMetrics,
        errorMetrics,
        cacheMetrics
      ] = await Promise.all([
        this.database.getConversationMetrics(timeRange),
        this.database.getModelPerformanceMetrics(timeRange),
        this.database.getUserJourneyMetrics(timeRange),
        this.database.getErrorMetrics(timeRange),
        this.database.getCacheMetrics(timeRange)
      ]);

      return {
        realTime: this.getCurrentMetrics(),
        conversations: conversationMetrics,
        modelPerformance,
        userJourney: userJourneyMetrics,
        errors: errorMetrics,
        cache: cacheMetrics,
        timeRange
      };
    } catch (error) {
      this.logger.error('Error getting dashboard metrics:', error);
      return this.getCurrentMetrics();
    }
  }

  async getPersonalizationMetrics(userId, timeRange = '30d') {
    if (!this.database) return null;

    try {
      const [
        userConversations,
        journeyProgression,
        productInteractions,
        engagementPatterns
      ] = await Promise.all([
        this.database.getUserConversationMetrics(userId, timeRange),
        this.database.getUserJourneyProgression(userId),
        this.database.getUserProductInteractions(userId, timeRange),
        this.database.getUserEngagementPatterns(userId, timeRange)
      ]);

      return {
        userId,
        conversations: userConversations,
        journey: journeyProgression,
        products: productInteractions,
        engagement: engagementPatterns,
        timeRange
      };
    } catch (error) {
      this.logger.error('Error getting personalization metrics:', error);
      return null;
    }
  }

  async getBusinessIntelligenceMetrics(timeRange = '7d') {
    if (!this.database) return null;

    try {
      const [
        conversionMetrics,
        satisfactionTrends,
        topConcerns,
        productPopularity,
        geographicDistribution,
        retentionMetrics
      ] = await Promise.all([
        this.database.getConversionMetrics(timeRange),
        this.database.getSatisfactionTrends(timeRange),
        this.database.getTopHairConcerns(timeRange),
        this.database.getProductPopularityMetrics(timeRange),
        this.database.getGeographicDistribution(timeRange),
        this.database.getUserRetentionMetrics(timeRange)
      ]);

      return {
        conversion: conversionMetrics,
        satisfaction: satisfactionTrends,
        concerns: topConcerns,
        products: productPopularity,
        geography: geographicDistribution,
        retention: retentionMetrics,
        timeRange,
        generatedAt: new Date()
      };
    } catch (error) {
      this.logger.error('Error getting business intelligence metrics:', error);
      return null;
    }
  }

  // Advanced analytics methods

  async analyzeUserBehaviorPatterns(limit = 1000) {
    if (!this.database) return null;

    try {
      const patterns = await this.database.analyzeUserBehaviorPatterns(limit);
      
      return {
        commonQuestionTypes: patterns.questionTypes,
        conversationFlows: patterns.flows,
        abandonmentPoints: patterns.abandonmentPoints,
        successfulInteractions: patterns.successfulInteractions,
        timePatterns: patterns.timePatterns,
        devicePatterns: patterns.devicePatterns
      };
    } catch (error) {
      this.logger.error('Error analyzing user behavior patterns:', error);
      return null;
    }
  }

  async generatePredictiveInsights() {
    if (!this.database) return null;

    try {
      const [
        churnRiskUsers,
        engagementPredictions,
        productRecommendationSuccess,
        seasonalTrends
      ] = await Promise.all([
        this.database.identifyChurnRiskUsers(),
        this.database.predictUserEngagement(),
        this.database.analyzeRecommendationSuccess(),
        this.database.analyzeSeasonalTrends()
      ]);

      return {
        churnRisk: churnRiskUsers,
        engagement: engagementPredictions,
        recommendations: productRecommendationSuccess,
        seasonal: seasonalTrends,
        generatedAt: new Date()
      };
    } catch (error) {
      this.logger.error('Error generating predictive insights:', error);
      return null;
    }
  }

  // A/B Testing support

  async trackABTest(testName, variant, userId, outcome) {
    const abTestEvent = {
      eventType: 'ab_test',
      userId,
      data: JSON.stringify({
        testName,
        variant,
        outcome,
        timestamp: new Date()
      }),
      timestamp: new Date(),
      brand: 'Sienna Naturals'
    };

    this.eventQueue.push(abTestEvent);
  }

  async getABTestResults(testName, timeRange = '30d') {
    if (!this.database) return null;

    try {
      return await this.database.getABTestResults(testName, timeRange);
    } catch (error) {
      this.logger.error('Error getting A/B test results:', error);
      return null;
    }
  }

  // Performance monitoring

  async getPerformanceMetrics() {
    const queueSizes = {
      conversations: this.conversationQueue.length,
      events: this.eventQueue.length,
      errors: this.errorQueue.length,
      metrics: this.metricsQueue.length
    };

    const totalQueueSize = Object.values(queueSizes).reduce((sum, size) => sum + size, 0);

    return {
      queueSizes,
      totalQueueSize,
      batchSize: this.batchSize,
      flushInterval: this.flushInterval,
      uptime: Date.now() - this.realTimeMetrics.startTime,
      memoryUsage: process.memoryUsage(),
      eventListeners: this.listenerCount('conversation') + this.listenerCount('event') + this.listenerCount('error')
    };
  }

  // Cleanup and shutdown

  async flush() {
    try {
      await this.flushBatches();
      this.logger.info('Analytics flush completed');
    } catch (error) {
      this.logger.error('Error during analytics flush:', error);
      throw error;
    }
  }

  async shutdown() {
    try {
      if (this.flushTimer) {
        clearInterval(this.flushTimer);
        this.flushTimer = null;
      }

      // Final flush
      await this.flush();
      
      // Clear event listeners
      this.removeAllListeners();
      
      this.logger.info('Analytics tracker shutdown completed');
    } catch (error) {
      this.logger.error('Error during analytics shutdown:', error);
      throw error;
    }
  }

  // Health check
  isHealthy() {
    const performance = this.getPerformanceMetrics();
    const totalQueueSize = performance.totalQueueSize;
    
    // Consider unhealthy if queues are backing up significantly
    return totalQueueSize < this.batchSize * 10;
  }
}