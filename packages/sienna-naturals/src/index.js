#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from 'dotenv';
import winston from 'winston';
import { v4 as uuidv4 } from 'uuid';

// Import our enhanced modules
import { AIModelManager } from './aiModelManager.js';
import { SmartPromptManager } from './smartPromptManager.js';
import { ResponseCache } from './responseCache.js';
import { AnalyticsTracker } from './analyticsTracker.js';
import { PersonalizationEngine } from './personalizationEngine.js';
import { ProactiveEngagement } from './proactiveEngagement.js';
import { DatabaseManager } from './database.js';
import { CircuitBreaker } from './circuitBreaker.js';

// Load environment variables
config();

class SiennaNaturalsChatbot {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 8080;
    this.logger = this.setupLogger();
    this.isInitialized = false;
    this.startTime = new Date();
    
    // Initialize components
    this.initializeComponents();
  }

  setupLogger() {
    return winston.createLogger({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        }),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
      ]
    });
  }

  async initializeComponents() {
    try {
      this.logger.info('Initializing Sienna Naturals Chatbot components...');

      // Initialize database connection
      this.db = new DatabaseManager();
      await this.db.connect();

      // Initialize AI Model Manager with multi-model fallback
      this.aiManager = new AIModelManager({
        models: [
          {
            name: 'gemini20FlashExp',
            type: 'google',
            apiKey: process.env.GOOGLE_API_KEY,
            model: 'gemini-2.0-flash-exp',
            priority: 1,
            maxTokens: 8192,
            temperature: 0.7
          },
          {
            name: 'gemini15Flash',
            type: 'google',
            apiKey: process.env.GOOGLE_API_KEY,
            model: 'gemini-1.5-flash',
            priority: 2,
            maxTokens: 8192,
            temperature: 0.7
          },
          {
            name: 'xaiGrok3Mini',
            type: 'xai',
            apiKey: process.env.XAI_API_KEY,
            model: 'grok-3-mini-fast',
            priority: 3,
            maxTokens: 4096,
            temperature: 0.6
          }
        ],
        circuitBreakerOptions: {
          failureThreshold: parseInt(process.env.CIRCUIT_BREAKER_FAILURE_THRESHOLD) || 5,
          resetTimeout: parseInt(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT) || 60000,
          monitorTimeout: parseInt(process.env.CIRCUIT_BREAKER_MONITOR_TIMEOUT) || 10000
        }
      });

      // Initialize smart prompt manager
      this.promptManager = new SmartPromptManager({
        brandName: process.env.BRAND_NAME || 'Sienna Naturals',
        brandFocus: process.env.BRAND_FOCUS || 'natural hair care',
        database: this.db
      });

      // Initialize response cache
      this.responseCache = new ResponseCache({
        redis: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT) || 6379,
          password: process.env.REDIS_PASSWORD
        },
        defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL) || 86400,
        maxSize: parseInt(process.env.CACHE_MAX_SIZE) || 1000
      });

      // Initialize analytics tracker
      this.analytics = new AnalyticsTracker({
        database: this.db,
        batchSize: parseInt(process.env.ANALYTICS_BATCH_SIZE) || 100,
        flushInterval: parseInt(process.env.ANALYTICS_FLUSH_INTERVAL) || 30000
      });

      // Initialize personalization engine
      this.personalization = new PersonalizationEngine({
        database: this.db,
        analytics: this.analytics
      });

      // Initialize proactive engagement system
      this.proactiveEngagement = new ProactiveEngagement({
        database: this.db,
        analytics: this.analytics,
        aiManager: this.aiManager
      });

      this.isInitialized = true;
      this.logger.info('All components initialized successfully');

    } catch (error) {
      this.logger.error('Failed to initialize components:', error);
      throw error;
    }
  }

  setupMiddleware() {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // Enable compression
    this.app.use(compression());

    // CORS configuration
    this.app.use(cors({
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://sienna-naturals.com', 'https://dashboard.sienna-naturals.com']
        : true,
      credentials: true
    }));

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
      message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 1000)
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use(limiter);

    // Request ID middleware
    this.app.use((req, res, next) => {
      req.requestId = uuidv4();
      res.setHeader('X-Request-ID', req.requestId);
      next();
    });

    // Logging middleware
    this.app.use((req, res, next) => {
      this.logger.info(`${req.method} ${req.path}`, {
        requestId: req.requestId,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      next();
    });
  }

  setupRoutes() {
    // Health check endpoints
    this.app.get('/health', (req, res) => {
      const uptime = Date.now() - this.startTime.getTime();
      const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: uptime,
        initialized: this.isInitialized,
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      };

      if (this.isInitialized) {
        healthStatus.components = {
          database: this.db?.isConnected() || false,
          redis: this.responseCache?.isConnected() || false,
          aiModels: this.aiManager?.getHealthStatus() || {}
        };
      }

      res.json(healthStatus);
    });

    this.app.get('/healthz', (req, res) => {
      res.status(200).send('OK');
    });

    // Main chat endpoint with full feature support
    this.app.post('/', async (req, res) => {
      await this.handleChatRequest(req, res);
    });

    // Brand-specific endpoint
    this.app.post('/sienna-naturals', async (req, res) => {
      req.body.brand = 'Sienna Naturals';
      await this.handleChatRequest(req, res);
    });

    // Webhook compatibility
    this.app.post('/webhook', async (req, res) => {
      await this.handleChatRequest(req, res);
    });

    // Analytics endpoints
    this.app.get('/analytics/dashboard', async (req, res) => {
      try {
        const analytics = await this.analytics.getDashboardMetrics();
        res.json(analytics);
      } catch (error) {
        this.logger.error('Dashboard analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
      }
    });

    this.app.get('/analytics/models', async (req, res) => {
      try {
        const modelStats = await this.aiManager.getModelStats();
        res.json(modelStats);
      } catch (error) {
        this.logger.error('Model analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch model statistics' });
      }
    });

    // Circuit breaker status
    this.app.get('/circuit-breakers', async (req, res) => {
      try {
        const status = this.aiManager.getCircuitBreakerStatus();
        res.json(status);
      } catch (error) {
        this.logger.error('Circuit breaker status error:', error);
        res.status(500).json({ error: 'Failed to fetch circuit breaker status' });
      }
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Endpoint not found',
        message: 'The requested resource was not found on this server',
        requestId: req.requestId
      });
    });

    // Error handler
    this.app.use((error, req, res, next) => {
      this.logger.error('Unhandled error:', {
        error: error.message,
        stack: error.stack,
        requestId: req.requestId
      });

      res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
        requestId: req.requestId
      });
    });
  }

  async handleChatRequest(req, res) {
    const startTime = Date.now();
    const requestId = req.requestId;

    try {
      const { message, userId, chatHistory = [], userProfile, imageUrl, brand = 'Sienna Naturals' } = req.body;

      // Validate required fields
      if (!message || !userId) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'Both message and userId are required',
          requestId
        });
      }

      this.logger.info('Processing chat request', {
        requestId,
        userId,
        messageLength: message.length,
        hasImage: !!imageUrl,
        brand
      });

      // Get or create user info
      let userInfo = userProfile || await this.db.getUserInfo(userId);
      if (!userInfo) {
        userInfo = await this.db.createUserProfile(userId, { brand });
      }

      // Analyze query context
      const contextAnalysis = await this.promptManager.analyzeQueryContext(message, chatHistory);
      
      // Check for cached response
      const cachedResponse = await this.responseCache.getCachedResponse(
        message, 
        { userId, userProfile: userInfo }, 
        contextAnalysis
      );

      if (cachedResponse) {
        this.logger.info('Returning cached response', { requestId, userId });
        
        // Track cache hit
        await this.analytics.trackEvent('cache_hit', {
          userId,
          requestId,
          responseTime: Date.now() - startTime
        });

        return res.json({
          ...cachedResponse,
          cached: true,
          requestId
        });
      }

      // Get all chats summary for context
      const allchatsSummary = await this.db.getAllChatsSummary(userId);

      // Build smart prompt
      const aiPrompt = await this.promptManager.buildSmartPrompt(
        userId, message, chatHistory, userInfo, allchatsSummary
      );

      // Handle image processing if present
      let imageAnalysis = null;
      if (imageUrl) {
        try {
          imageAnalysis = await this.aiManager.analyzeImage(imageUrl, {
            userId,
            context: contextAnalysis,
            brand
          });
        } catch (error) {
          this.logger.warn('Image analysis failed, continuing without image', { 
            error: error.message, 
            requestId 
          });
        }
      }

      // Generate AI response with fallback system
      const aiResponse = await this.aiManager.generateResponse({
        prompt: aiPrompt,
        imageAnalysis,
        context: contextAnalysis,
        userId,
        requestId
      });

      // Apply personalization
      const personalizedResponse = await this.personalization.personalizeResponse(
        aiResponse,
        userInfo,
        contextAnalysis
      );

      // Prepare final response
      const response = {
        response: personalizedResponse.text,
        model: personalizedResponse.modelUsed,
        responseTime: Date.now() - startTime,
        confidence: personalizedResponse.confidence || 0.9,
        suggestions: personalizedResponse.suggestions || [],
        requestId
      };

      // Cache the response
      await this.responseCache.cacheResponse(
        message,
        { userId, userProfile: userInfo },
        contextAnalysis,
        response
      );

      // Save conversation to database
      await this.db.saveConversation({
        userId,
        userMessage: message,
        aiResponse: response.response,
        model: response.model,
        responseTime: response.responseTime,
        context: contextAnalysis,
        imageUrl,
        requestId
      });

      // Track analytics
      await this.analytics.trackConversation({
        userId,
        requestId,
        model: response.model,
        responseTime: response.responseTime,
        context: contextAnalysis,
        hasImage: !!imageUrl,
        cached: false
      });

      // Trigger proactive engagement check
      this.proactiveEngagement.checkEngagementOpportunity(userId, message, response.response)
        .catch(error => this.logger.warn('Proactive engagement error:', error));

      this.logger.info('Chat request completed successfully', {
        requestId,
        userId,
        model: response.model,
        responseTime: response.responseTime
      });

      res.json(response);

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      this.logger.error('Chat request failed', {
        error: error.message,
        stack: error.stack,
        requestId,
        responseTime
      });

      // Track error
      await this.analytics.trackError({
        requestId,
        error: error.message,
        responseTime
      }).catch(() => {}); // Don't let analytics errors crash the response

      res.status(500).json({
        error: 'Failed to process message',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later',
        requestId
      });
    }
  }

  async start() {
    try {
      // Wait for initialization to complete
      if (!this.isInitialized) {
        this.logger.info('Waiting for initialization to complete...');
        await new Promise((resolve) => {
          const checkInit = () => {
            if (this.isInitialized) {
              resolve();
            } else {
              setTimeout(checkInit, 100);
            }
          };
          checkInit();
        });
      }

      // Setup middleware and routes
      this.setupMiddleware();
      this.setupRoutes();

      // Start server
      this.server = this.app.listen(this.port, '0.0.0.0', () => {
        this.logger.info(`Sienna Naturals Chatbot server started on port ${this.port}`, {
          port: this.port,
          environment: process.env.NODE_ENV,
          timestamp: new Date().toISOString()
        });

        // Log component status
        this.logger.info('Component status:', {
          database: this.db?.isConnected(),
          redis: this.responseCache?.isConnected(),
          aiModels: this.aiManager?.getAvailableModels().length
        });
      });

      // Graceful shutdown handlers
      const gracefulShutdown = async (signal) => {
        this.logger.info(`Received ${signal}, shutting down gracefully...`);
        
        this.server.close(async () => {
          try {
            // Close all connections
            if (this.db) await this.db.disconnect();
            if (this.responseCache) await this.responseCache.disconnect();
            if (this.analytics) await this.analytics.flush();
            
            this.logger.info('Graceful shutdown completed');
            process.exit(0);
          } catch (error) {
            this.logger.error('Error during shutdown:', error);
            process.exit(1);
          }
        });

        // Force shutdown after 10 seconds
        setTimeout(() => {
          this.logger.warn('Forced shutdown due to timeout');
          process.exit(1);
        }, 10000);
      };

      process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
      process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    } catch (error) {
      this.logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Start the chatbot if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const chatbot = new SiennaNaturalsChatbot();
  chatbot.start().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { SiennaNaturalsChatbot };