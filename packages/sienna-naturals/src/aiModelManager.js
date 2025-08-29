import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import axios from 'axios';
import { CircuitBreaker } from './circuitBreaker.js';
import winston from 'winston';

export class AIModelManager {
  constructor(options) {
    this.models = options.models || [];
    this.circuitBreakerOptions = options.circuitBreakerOptions || {};
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      transports: [new winston.transports.Console()]
    });

    // Initialize AI clients and circuit breakers
    this.clients = new Map();
    this.circuitBreakers = new Map();
    this.modelStats = new Map();

    this.initializeModels();
  }

  initializeModels() {
    this.models.forEach(modelConfig => {
      try {
        // Initialize client based on model type
        let client;
        switch (modelConfig.type) {
          case 'google':
            client = new GoogleGenerativeAI(modelConfig.apiKey);
            break;
          case 'openai':
            client = new OpenAI({ apiKey: modelConfig.apiKey });
            break;
          case 'xai':
            client = axios.create({
              baseURL: 'https://api.x.ai/v1',
              headers: {
                'Authorization': `Bearer ${modelConfig.apiKey}`,
                'Content-Type': 'application/json'
              }
            });
            break;
          default:
            throw new Error(`Unsupported model type: ${modelConfig.type}`);
        }

        this.clients.set(modelConfig.name, { client, config: modelConfig });

        // Initialize circuit breaker for this model
        const circuitBreaker = new CircuitBreaker(
          (prompt) => this.callModel(modelConfig.name, prompt),
          {
            failureThreshold: this.circuitBreakerOptions.failureThreshold || 5,
            resetTimeout: this.circuitBreakerOptions.resetTimeout || 60000,
            monitorTimeout: this.circuitBreakerOptions.monitorTimeout || 10000,
            name: modelConfig.name
          }
        );

        this.circuitBreakers.set(modelConfig.name, circuitBreaker);

        // Initialize stats tracking
        this.modelStats.set(modelConfig.name, {
          totalRequests: 0,
          successfulRequests: 0,
          failedRequests: 0,
          totalResponseTime: 0,
          averageResponseTime: 0,
          lastUsed: null,
          circuitBreakerState: 'closed'
        });

        this.logger.info(`Initialized AI model: ${modelConfig.name}`);
      } catch (error) {
        this.logger.error(`Failed to initialize model ${modelConfig.name}:`, error);
      }
    });
  }

  async generateResponse(options) {
    const { prompt, imageAnalysis, context, userId, requestId } = options;
    
    // Sort models by priority
    const sortedModels = this.models
      .filter(model => this.circuitBreakers.get(model.name)?.isCallAllowed())
      .sort((a, b) => a.priority - b.priority);

    if (sortedModels.length === 0) {
      throw new Error('No AI models available - all circuit breakers are open');
    }

    let lastError;
    
    for (const modelConfig of sortedModels) {
      try {
        const startTime = Date.now();
        const circuitBreaker = this.circuitBreakers.get(modelConfig.name);
        
        this.logger.info(`Attempting response with model: ${modelConfig.name}`, {
          requestId,
          userId,
          model: modelConfig.name
        });

        // Build complete prompt with image analysis if present
        let completePrompt = prompt;
        if (imageAnalysis && imageAnalysis.description) {
          completePrompt += `\n\nImage Analysis: ${imageAnalysis.description}`;
        }

        const result = await circuitBreaker.call({
          prompt: completePrompt,
          imageAnalysis,
          context,
          modelConfig
        });

        const responseTime = Date.now() - startTime;
        
        // Update stats
        this.updateModelStats(modelConfig.name, true, responseTime);
        
        this.logger.info(`Successful response from model: ${modelConfig.name}`, {
          requestId,
          userId,
          model: modelConfig.name,
          responseTime
        });

        return {
          text: result.text,
          modelUsed: modelConfig.name,
          confidence: result.confidence || 0.9,
          suggestions: result.suggestions || [],
          responseTime
        };

      } catch (error) {
        lastError = error;
        this.updateModelStats(modelConfig.name, false);
        
        this.logger.warn(`Model ${modelConfig.name} failed, trying next model`, {
          requestId,
          userId,
          error: error.message,
          model: modelConfig.name
        });
        
        continue;
      }
    }

    // If all models failed
    this.logger.error('All AI models failed', {
      requestId,
      userId,
      lastError: lastError?.message,
      availableModels: sortedModels.length
    });

    throw new Error(`All AI models failed. Last error: ${lastError?.message}`);
  }

  async callModel(modelName, options) {
    const modelData = this.clients.get(modelName);
    if (!modelData) {
      throw new Error(`Model ${modelName} not found`);
    }

    const { client, config } = modelData;
    const { prompt, imageAnalysis, context, modelConfig } = options;

    switch (config.type) {
      case 'google':
        return await this.callGoogleModel(client, config, prompt, imageAnalysis);
      case 'openai':
        return await this.callOpenAIModel(client, config, prompt, imageAnalysis);
      case 'xai':
        return await this.callXAIModel(client, config, prompt, imageAnalysis);
      default:
        throw new Error(`Unsupported model type: ${config.type}`);
    }
  }

  async callGoogleModel(client, config, prompt, imageAnalysis) {
    try {
      const model = client.getGenerativeModel({ model: config.model });
      
      let parts = [{ text: prompt }];
      
      // Add image if present
      if (imageAnalysis && imageAnalysis.imageData) {
        parts.push({
          inlineData: {
            mimeType: imageAnalysis.mimeType || 'image/jpeg',
            data: imageAnalysis.imageData
          }
        });
      }

      const result = await model.generateContent({
        contents: [{ role: 'user', parts }],
        generationConfig: {
          temperature: config.temperature || 0.7,
          maxOutputTokens: config.maxTokens || 8192,
          topP: 0.8,
          topK: 40
        }
      });

      const response = await result.response;
      const text = response.text();

      return {
        text: text.trim(),
        confidence: 0.95,
        finishReason: response.candidates?.[0]?.finishReason
      };
    } catch (error) {
      this.logger.error(`Google AI model error:`, error);
      throw error;
    }
  }

  async callOpenAIModel(client, config, prompt, imageAnalysis) {
    try {
      const messages = [{ role: 'user', content: prompt }];

      // Add image if present (for vision models)
      if (imageAnalysis && imageAnalysis.imageUrl) {
        messages[0].content = [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: imageAnalysis.imageUrl } }
        ];
      }

      const completion = await client.chat.completions.create({
        model: config.model,
        messages,
        max_tokens: config.maxTokens || 4096,
        temperature: config.temperature || 0.7,
        top_p: 0.8
      });

      return {
        text: completion.choices[0]?.message?.content?.trim() || '',
        confidence: 0.9,
        finishReason: completion.choices[0]?.finish_reason
      };
    } catch (error) {
      this.logger.error(`OpenAI model error:`, error);
      throw error;
    }
  }

  async callXAIModel(client, config, prompt, imageAnalysis) {
    try {
      const requestBody = {
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: config.maxTokens || 4096,
        temperature: config.temperature || 0.6,
        top_p: 0.8
      };

      const response = await client.post('/chat/completions', requestBody);
      
      return {
        text: response.data.choices[0]?.message?.content?.trim() || '',
        confidence: 0.85,
        finishReason: response.data.choices[0]?.finish_reason
      };
    } catch (error) {
      this.logger.error(`xAI model error:`, error);
      throw error;
    }
  }

  async analyzeImage(imageUrl, options = {}) {
    const { userId, context, brand } = options;

    // Try Google Vision API first (most reliable for image analysis)
    const visionModels = this.models.filter(m => 
      m.type === 'google' && this.circuitBreakers.get(m.name)?.isCallAllowed()
    ).sort((a, b) => a.priority - b.priority);

    if (visionModels.length === 0) {
      throw new Error('No vision models available');
    }

    for (const modelConfig of visionModels) {
      try {
        const circuitBreaker = this.circuitBreakers.get(modelConfig.name);
        
        const result = await circuitBreaker.call({
          prompt: `Analyze this image for ${brand} hair care context. Describe what you see and how it relates to natural hair care, hair types, styling, or hair health. Focus on actionable insights for hair care advice.`,
          imageAnalysis: { imageUrl, imageData: await this.fetchImageAsBase64(imageUrl) },
          context,
          modelConfig
        });

        return {
          description: result.text,
          modelUsed: modelConfig.name,
          confidence: result.confidence || 0.9
        };
      } catch (error) {
        this.logger.warn(`Image analysis failed with ${modelConfig.name}:`, error);
        continue;
      }
    }

    throw new Error('All image analysis models failed');
  }

  async fetchImageAsBase64(imageUrl) {
    try {
      const response = await axios.get(imageUrl, { 
        responseType: 'arraybuffer',
        timeout: 10000 
      });
      return Buffer.from(response.data, 'binary').toString('base64');
    } catch (error) {
      this.logger.warn(`Failed to fetch image as base64:`, error);
      return null;
    }
  }

  updateModelStats(modelName, success, responseTime = 0) {
    const stats = this.modelStats.get(modelName);
    if (!stats) return;

    stats.totalRequests++;
    stats.lastUsed = new Date();

    if (success) {
      stats.successfulRequests++;
      stats.totalResponseTime += responseTime;
      stats.averageResponseTime = stats.totalResponseTime / stats.successfulRequests;
    } else {
      stats.failedRequests++;
    }

    // Update circuit breaker state
    const circuitBreaker = this.circuitBreakers.get(modelName);
    if (circuitBreaker) {
      stats.circuitBreakerState = circuitBreaker.getState();
    }
  }

  getModelStats() {
    const stats = {};
    this.modelStats.forEach((modelStats, modelName) => {
      const circuitBreaker = this.circuitBreakers.get(modelName);
      stats[modelName] = {
        ...modelStats,
        successRate: modelStats.totalRequests > 0 
          ? (modelStats.successfulRequests / modelStats.totalRequests) * 100 
          : 0,
        isAvailable: circuitBreaker ? circuitBreaker.isCallAllowed() : false,
        circuitBreakerState: circuitBreaker ? circuitBreaker.getState() : 'unknown'
      };
    });
    return stats;
  }

  getHealthStatus() {
    const health = {};
    this.models.forEach(model => {
      const circuitBreaker = this.circuitBreakers.get(model.name);
      const stats = this.modelStats.get(model.name);
      
      health[model.name] = {
        available: circuitBreaker ? circuitBreaker.isCallAllowed() : false,
        state: circuitBreaker ? circuitBreaker.getState() : 'unknown',
        successRate: stats && stats.totalRequests > 0 
          ? (stats.successfulRequests / stats.totalRequests) * 100 
          : 0,
        lastUsed: stats?.lastUsed
      };
    });
    return health;
  }

  getCircuitBreakerStatus() {
    const status = {};
    this.circuitBreakers.forEach((cb, modelName) => {
      status[modelName] = {
        state: cb.getState(),
        failureCount: cb.getFailureCount(),
        lastFailureTime: cb.getLastFailureTime(),
        nextAttempt: cb.getNextAttemptTime(),
        isCallAllowed: cb.isCallAllowed()
      };
    });
    return status;
  }

  getAvailableModels() {
    return this.models
      .filter(model => this.circuitBreakers.get(model.name)?.isCallAllowed())
      .sort((a, b) => a.priority - b.priority);
  }

  async resetCircuitBreaker(modelName) {
    const circuitBreaker = this.circuitBreakers.get(modelName);
    if (circuitBreaker) {
      circuitBreaker.reset();
      this.logger.info(`Circuit breaker reset for model: ${modelName}`);
    }
  }

  async resetAllCircuitBreakers() {
    this.circuitBreakers.forEach((cb, modelName) => {
      cb.reset();
      this.logger.info(`Circuit breaker reset for model: ${modelName}`);
    });
  }
}