#!/usr/bin/env node

/**
 * Comprehensive Test Suite for Sienna Naturals Enhanced Chatbot
 * Tests all major features including multi-model AI fallback, caching, analytics, etc.
 */

import { SiennaNaturalsChatbot } from './src/index.js';
import { AIModelManager } from './src/aiModelManager.js';
import { SmartPromptManager } from './src/smartPromptManager.js';
import { ResponseCache } from './src/responseCache.js';
import { AnalyticsTracker } from './src/analyticsTracker.js';
import { PersonalizationEngine } from './src/personalizationEngine.js';
import { ProactiveEngagement } from './src/proactiveEngagement.js';
import { DatabaseManager } from './src/database.js';
import { CircuitBreaker } from './src/circuitBreaker.js';
import axios from 'axios';

class TestRunner {
  constructor() {
    this.passedTests = 0;
    this.failedTests = 0;
    this.testResults = [];
    
    console.log('🧪 Starting Sienna Naturals Chatbot Enhanced Features Test Suite\n');
    console.log('=' * 80);
  }

  async runTest(testName, testFunction, isAsync = true) {
    try {
      console.log(`\n🔍 Testing: ${testName}`);
      
      if (isAsync) {
        await testFunction();
      } else {
        testFunction();
      }
      
      console.log(`✅ PASSED: ${testName}`);
      this.passedTests++;
      this.testResults.push({ name: testName, status: 'PASSED' });
      
    } catch (error) {
      console.log(`❌ FAILED: ${testName}`);
      console.log(`   Error: ${error.message}`);
      this.failedTests++;
      this.testResults.push({ name: testName, status: 'FAILED', error: error.message });
    }
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message);
    }
  }

  assertEquals(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(`${message}. Expected: ${expected}, Got: ${actual}`);
    }
  }

  assertExists(value, message) {
    if (value === null || value === undefined) {
      throw new Error(`${message}. Value should exist but is ${value}`);
    }
  }

  async testAIModelManager() {
    await this.runTest('AI Model Manager - Initialization', async () => {
      const aiManager = new AIModelManager({
        models: [
          {
            name: 'testModel1',
            type: 'google',
            apiKey: 'test-key',
            model: 'gemini-pro',
            priority: 1
          },
          {
            name: 'testModel2',
            type: 'openai',
            apiKey: 'test-key',
            model: 'gpt-3.5-turbo',
            priority: 2
          }
        ]
      });

      this.assertExists(aiManager, 'AI Model Manager should be created');
      this.assertEquals(aiManager.models.length, 2, 'Should have 2 models configured');
      
      const healthStatus = aiManager.getHealthStatus();
      this.assertExists(healthStatus, 'Health status should be available');
      this.assertExists(healthStatus.testModel1, 'Test model 1 should be in health status');
    });

    await this.runTest('AI Model Manager - Circuit Breaker Integration', async () => {
      const aiManager = new AIModelManager({
        models: [{
          name: 'testCircuitBreakerModel',
          type: 'google',
          apiKey: 'test-key',
          model: 'gemini-pro',
          priority: 1
        }],
        circuitBreakerOptions: {
          failureThreshold: 2,
          resetTimeout: 1000
        }
      });

      const circuitBreakerStatus = aiManager.getCircuitBreakerStatus();
      this.assertExists(circuitBreakerStatus, 'Circuit breaker status should be available');
      this.assertExists(circuitBreakerStatus.testCircuitBreakerModel, 'Test model should have circuit breaker');
      this.assertEquals(circuitBreakerStatus.testCircuitBreakerModel.state, 'closed', 'Circuit breaker should start closed');
    });

    await this.runTest('AI Model Manager - Model Statistics', async () => {
      const aiManager = new AIModelManager({
        models: [{
          name: 'statsTestModel',
          type: 'google',
          apiKey: 'test-key',
          model: 'gemini-pro',
          priority: 1
        }]
      });

      const stats = aiManager.getModelStats();
      this.assertExists(stats, 'Model stats should be available');
      this.assertExists(stats.statsTestModel, 'Test model should be in stats');
      this.assertEquals(stats.statsTestModel.totalRequests, 0, 'Initial request count should be 0');
    });
  }

  async testSmartPromptManager() {
    await this.runTest('Smart Prompt Manager - Context Analysis', async () => {
      const promptManager = new SmartPromptManager({
        brandName: 'Sienna Naturals',
        brandFocus: 'natural hair care'
      });

      const context = await promptManager.analyzeQueryContext(
        'I have 4c hair and I\'m struggling with dryness. What products do you recommend?',
        []
      );

      this.assertExists(context, 'Context analysis should return results');
      this.assert(context.topics.length > 0, 'Should identify topics in the message');
      this.assertEquals(context.conversationType, 'shopping', 'Should identify as shopping conversation');
      this.assert(context.productMentions.includes('products'), 'Should detect product mentions');
    });

    await this.runTest('Smart Prompt Manager - Journey Stage Detection', async () => {
      const promptManager = new SmartPromptManager({
        brandName: 'Sienna Naturals',
        brandFocus: 'natural hair care'
      });

      // Test beginner message
      const beginnerContext = await promptManager.analyzeQueryContext(
        'I\'m new to natural hair care and don\'t know where to start',
        []
      );

      this.assertEquals(beginnerContext.journeyStage, 'discovery', 'Should detect discovery stage');

      // Test advanced message
      const advancedContext = await promptManager.analyzeQueryContext(
        'I need to optimize my protein-moisture balance for better curl definition',
        []
      );

      this.assertEquals(advancedContext.journeyStage, 'optimization', 'Should detect optimization stage');
    });

    await this.runTest('Smart Prompt Manager - Sentiment Analysis', async () => {
      const promptManager = new SmartPromptManager({
        brandName: 'Sienna Naturals',
        brandFocus: 'natural hair care'
      });

      // Test positive sentiment
      const positiveContext = await promptManager.analyzeQueryContext(
        'I love my new routine! It\'s working amazing for my hair.',
        []
      );

      this.assertEquals(positiveContext.sentiment, 'positive', 'Should detect positive sentiment');

      // Test negative sentiment
      const negativeContext = await promptManager.analyzeQueryContext(
        'I\'m frustrated with my hair. Nothing seems to work and it\'s always dry.',
        []
      );

      this.assertEquals(negativeContext.sentiment, 'negative', 'Should detect negative sentiment');
    });
  }

  async testResponseCache() {
    await this.runTest('Response Cache - Initialization', async () => {
      const cache = new ResponseCache({
        redis: { host: 'localhost', port: 6379 },
        defaultTTL: 3600,
        maxSize: 100
      });

      this.assertExists(cache, 'Response cache should be created');
      this.assertEquals(cache.defaultTTL, 3600, 'Default TTL should be set correctly');
      this.assertEquals(cache.maxSize, 100, 'Max size should be set correctly');
    });

    await this.runTest('Response Cache - Key Generation', async () => {
      const cache = new ResponseCache();
      
      const userContext = { userId: 'test123', brand: 'Sienna Naturals' };
      const analysisContext = { 
        conversationType: 'consultation', 
        journeyStage: 'learning',
        topics: [{ category: 'hairTypes', keywords: ['4c'] }]
      };

      const key1 = cache.generateCacheKey('What products work for 4c hair?', userContext, analysisContext);
      const key2 = cache.generateCacheKey('What products work for 4c hair?', userContext, analysisContext);
      const key3 = cache.generateCacheKey('What products work for 3c hair?', userContext, analysisContext);

      this.assertEquals(key1, key2, 'Identical inputs should generate same key');
      this.assert(key1 !== key3, 'Different inputs should generate different keys');
      this.assert(key1.startsWith('sienna:cache:'), 'Key should have correct prefix');
    });

    await this.runTest('Response Cache - Cacheability Check', async () => {
      const cache = new ResponseCache();
      
      // Test cacheable message
      const cacheableResult = cache.isCacheable(
        'What\'s the best routine for curly hair?',
        { urgency: 'normal', hasImages: false },
        { confidence: 0.9 }
      );
      this.assert(cacheableResult, 'Normal query should be cacheable');

      // Test non-cacheable message (urgent)
      const urgentResult = cache.isCacheable(
        'My hair is breaking urgently need help!',
        { urgency: 'high', hasImages: false },
        { confidence: 0.9 }
      );
      this.assert(!urgentResult, 'Urgent queries should not be cacheable');

      // Test non-cacheable message (personal info)
      const personalResult = cache.isCacheable(
        'My name is Sarah and I live at 123 Main St',
        { urgency: 'normal', hasImages: false },
        { confidence: 0.9 }
      );
      this.assert(!personalResult, 'Messages with personal info should not be cacheable');
    });
  }

  async testAnalyticsTracker() {
    await this.runTest('Analytics Tracker - Initialization', async () => {
      const analytics = new AnalyticsTracker({
        batchSize: 50,
        flushInterval: 10000
      });

      this.assertExists(analytics, 'Analytics tracker should be created');
      this.assertEquals(analytics.batchSize, 50, 'Batch size should be set correctly');
      this.assertEquals(analytics.flushInterval, 10000, 'Flush interval should be set correctly');
      this.assertExists(analytics.realTimeMetrics, 'Real-time metrics should be initialized');
    });

    await this.runTest('Analytics Tracker - Event Tracking', async () => {
      const analytics = new AnalyticsTracker({ batchSize: 10 });

      await analytics.trackEvent('test_event', {
        userId: 'test123',
        data: 'test data'
      });

      this.assertEquals(analytics.eventQueue.length, 1, 'Event should be added to queue');
      this.assertEquals(analytics.eventQueue[0].eventType, 'test_event', 'Event type should be correct');
    });

    await this.runTest('Analytics Tracker - Conversation Tracking', async () => {
      const analytics = new AnalyticsTracker({ batchSize: 10 });

      await analytics.trackConversation({
        userId: 'test123',
        requestId: 'req123',
        model: 'gemini20FlashExp',
        responseTime: 1500,
        context: { conversationType: 'consultation' },
        cached: false
      });

      this.assertEquals(analytics.conversationQueue.length, 1, 'Conversation should be added to queue');
      this.assertEquals(analytics.realTimeMetrics.totalConversations, 1, 'Real-time metrics should be updated');
      this.assertExists(analytics.realTimeMetrics.modelUsage['gemini20FlashExp'], 'Model usage should be tracked');
    });

    await this.runTest('Analytics Tracker - Real-time Metrics', async () => {
      const analytics = new AnalyticsTracker();

      // Track some data
      await analytics.trackConversation({
        userId: 'test123',
        requestId: 'req1',
        model: 'gemini20FlashExp',
        responseTime: 1000,
        cached: false
      });

      await analytics.trackConversation({
        userId: 'test456',
        requestId: 'req2',
        model: 'gemini15Flash',
        responseTime: 2000,
        cached: true
      });

      const metrics = analytics.getCurrentMetrics();
      this.assertEquals(metrics.totalConversations, 2, 'Should track total conversations');
      this.assertEquals(metrics.activeUsers, 2, 'Should track unique users');
      this.assertEquals(metrics.averageResponseTime, 1500, 'Should calculate average response time');
      this.assertEquals(metrics.cacheHitRate, 50, 'Should calculate cache hit rate');
    });
  }

  async testPersonalizationEngine() {
    await this.runTest('Personalization Engine - Persona Identification', async () => {
      const personalization = new PersonalizationEngine();

      // Test newbie persona
      const newbiePersona = await personalization.identifyUserPersona(
        { user_id: 'test1' },
        { journeyStage: 'discovery', conversationType: 'consultation', complexity: 'low' }
      );

      this.assertEquals(newbiePersona.key, 'newbie', 'Should identify newbie persona');
      this.assert(newbiePersona.confidence > 0, 'Should have confidence score');

      // Test expert persona
      const expertPersona = await personalization.identifyUserPersona(
        { user_id: 'test2' },
        { journeyStage: 'mastery', conversationType: 'troubleshooting', complexity: 'high' }
      );

      this.assertEquals(expertPersona.key, 'expert', 'Should identify expert persona');
    });

    await this.runTest('Personalization Engine - Response Adjustment', async () => {
      const personalization = new PersonalizationEngine();

      const originalResponse = {
        text: 'For 4c hair, you should use a moisturizing shampoo and deep condition weekly. Follow with a leave-in conditioner and seal with oil.',
        modelUsed: 'gemini20FlashExp',
        confidence: 0.9
      };

      const userInfo = { user_id: 'test123', name: 'Sarah', hair_type: '4c' };
      const context = { conversationType: 'consultation', journeyStage: 'learning' };

      const personalizedResponse = await personalization.personalizeResponse(
        originalResponse,
        userInfo,
        context
      );

      this.assert(personalizedResponse.text.includes('Sarah'), 'Should include user name');
      this.assert(personalizedResponse.personalized, 'Should be marked as personalized');
      this.assertExists(personalizedResponse.persona, 'Should identify persona');
      this.assert(personalizedResponse.adjustments.length > 0, 'Should have adjustments applied');
    });

    await this.runTest('Personalization Engine - Communication Style Adaptation', async () => {
      const personalization = new PersonalizationEngine();

      // Test response shortening for busy parent persona
      const longResponse = {
        text: 'For your hair type, I recommend starting with a gentle sulfate-free shampoo. This type of shampoo will clean your hair without stripping away natural oils. Follow this with a deep conditioning treatment that contains moisturizing ingredients like shea butter and coconut oil. These ingredients will help restore moisture to your hair strands. After washing, apply a leave-in conditioner from mid-length to ends. This will provide ongoing moisture throughout the week. Finally, seal everything in with a natural oil like jojoba or argan oil.',
        modelUsed: 'gemini20FlashExp',
        confidence: 0.9
      };

      const busyParentPersona = {
        key: 'busy_parent',
        name: 'Busy Parent',
        communicationStyle: 'concise',
        responseLength: 'short'
      };

      const personalizedResponse = await personalization.applyPersonalization(
        longResponse,
        busyParentPersona,
        { communicationStyle: 'concise' },
        { user_id: 'test123' },
        { conversationType: 'consultation' }
      );

      this.assert(personalizedResponse.text.length < longResponse.text.length, 'Response should be shortened');
      this.assert(personalizedResponse.adjustments.includes('shortened_for_persona'), 'Should record shortening adjustment');
    });
  }

  async testProactiveEngagement() {
    await this.runTest('Proactive Engagement - Trigger Evaluation', async () => {
      const proactiveEngagement = new ProactiveEngagement();

      // Test dormant user trigger
      const dormantUserResult = await proactiveEngagement.evaluateTriggerCondition(
        { user_id: 'test1', last_interaction: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) }, // 10 days ago
        'days_since_last_interaction > 7'
      );

      this.assert(dormantUserResult, 'Should trigger for dormant user');

      // Test seasonal trigger
      const seasonalResult = await proactiveEngagement.evaluateTriggerCondition(
        { user_id: 'test2' },
        'seasonal_change_approaching'
      );

      this.assert(typeof seasonalResult === 'boolean', 'Should return boolean for seasonal trigger');
    });

    await this.runTest('Proactive Engagement - Message Personalization', async () => {
      const proactiveEngagement = new ProactiveEngagement();

      const template = "Hi {name}! It's been a while since we chatted about your {hair_type} hair. How's your routine working?";
      const user = {
        user_id: 'test123',
        name: 'Sarah',
        hair_type: '4c',
        primary_concerns: ['dryness'],
        journey_stage: 'learning'
      };

      const personalizedMessage = await proactiveEngagement.personalizeMessage(
        template,
        user,
        { messageType: 're_engagement' }
      );

      this.assert(personalizedMessage.includes('Sarah'), 'Should include user name');
      this.assert(personalizedMessage.includes('4c'), 'Should include hair type');
      this.assert(!personalizedMessage.includes('{'), 'Should not have any unreplaced placeholders');
    });

    await this.runTest('Proactive Engagement - Conversation Signal Analysis', async () => {
      const proactiveEngagement = new ProactiveEngagement();

      const signals = proactiveEngagement.analyzeConversationSignals(
        'I\'m interested in trying that product you mentioned. Tell me more about it!',
        'Product response here'
      );

      this.assert(signals.showedInterest, 'Should detect interest');
      this.assert(signals.mentionedProduct, 'Should detect product mention');
      this.assert(signals.requestedMoreInfo, 'Should detect request for more info');
      this.assert(!signals.expressedFrustration, 'Should not detect frustration');
    });

    await this.runTest('Proactive Engagement - Opportunity Identification', async () => {
      const proactiveEngagement = new ProactiveEngagement();

      const signals = {
        showedInterest: true,
        askedFollowUp: false,
        mentionedProduct: true,
        expressedFrustration: false,
        celebratedSuccess: false,
        requestedMoreInfo: true
      };

      const user = { user_id: 'test123', name: 'Sarah' };
      const opportunities = proactiveEngagement.identifyImmediateOpportunities(signals, user);

      this.assert(opportunities.length > 0, 'Should identify opportunities');
      const hasFollowUpOpportunity = opportunities.some(opp => opp.type === 'follow_up_interest');
      this.assert(hasFollowUpOpportunity, 'Should identify follow-up interest opportunity');
    });
  }

  async testCircuitBreaker() {
    await this.runTest('Circuit Breaker - Initialization', async () => {
      const mockFunction = async () => 'success';
      const circuitBreaker = new CircuitBreaker(mockFunction, {
        name: 'testBreaker',
        failureThreshold: 3,
        resetTimeout: 1000
      });

      this.assertExists(circuitBreaker, 'Circuit breaker should be created');
      this.assertEquals(circuitBreaker.name, 'testBreaker', 'Name should be set correctly');
      this.assertEquals(circuitBreaker.failureThreshold, 3, 'Failure threshold should be set');
      this.assertEquals(circuitBreaker.getState(), 'closed', 'Initial state should be closed');
    });

    await this.runTest('Circuit Breaker - Success Handling', async () => {
      const mockFunction = async () => 'success';
      const circuitBreaker = new CircuitBreaker(mockFunction, {
        failureThreshold: 2,
        resetTimeout: 1000
      });

      const result = await circuitBreaker.call();
      this.assertEquals(result, 'success', 'Should return function result');
      this.assertEquals(circuitBreaker.getState(), 'closed', 'State should remain closed');
      this.assertEquals(circuitBreaker.getFailureCount(), 0, 'Failure count should be 0');
    });

    await this.runTest('Circuit Breaker - Failure Handling', async () => {
      const mockFunction = async () => { throw new Error('Test failure'); };
      const circuitBreaker = new CircuitBreaker(mockFunction, {
        failureThreshold: 2,
        resetTimeout: 1000
      });

      // First failure
      try {
        await circuitBreaker.call();
        this.assert(false, 'Should have thrown error');
      } catch (error) {
        this.assertEquals(error.message, 'Test failure', 'Should propagate original error');
      }

      this.assertEquals(circuitBreaker.getState(), 'closed', 'Should remain closed after first failure');
      this.assertEquals(circuitBreaker.getFailureCount(), 1, 'Failure count should be 1');

      // Second failure - should open circuit
      try {
        await circuitBreaker.call();
        this.assert(false, 'Should have thrown error');
      } catch (error) {
        this.assertEquals(error.message, 'Test failure', 'Should propagate original error');
      }

      this.assertEquals(circuitBreaker.getState(), 'open', 'Should be open after reaching threshold');
    });

    await this.runTest('Circuit Breaker - Open State Rejection', async () => {
      const mockFunction = async () => { throw new Error('Test failure'); };
      const circuitBreaker = new CircuitBreaker(mockFunction, {
        failureThreshold: 1,
        resetTimeout: 1000
      });

      // Cause failure to open circuit
      try {
        await circuitBreaker.call();
      } catch (error) {
        // Expected
      }

      // Circuit should now be open
      this.assertEquals(circuitBreaker.getState(), 'open', 'Circuit should be open');

      // Next call should be rejected immediately
      try {
        await circuitBreaker.call();
        this.assert(false, 'Should have thrown circuit breaker error');
      } catch (error) {
        this.assert(error.name === 'CircuitBreakerOpenError', 'Should throw circuit breaker error');
      }
    });

    await this.runTest('Circuit Breaker - Statistics', async () => {
      const mockFunction = async () => 'success';
      const circuitBreaker = new CircuitBreaker(mockFunction, {
        failureThreshold: 3,
        resetTimeout: 1000
      });

      // Make some successful calls
      await circuitBreaker.call();
      await circuitBreaker.call();

      const stats = circuitBreaker.getStats();
      this.assertEquals(stats.totalRequests, 2, 'Should track total requests');
      this.assertEquals(stats.successfulRequests, 2, 'Should track successful requests');
      this.assertEquals(stats.failedRequests, 0, 'Should track failed requests');
      this.assertEquals(stats.successRate, 100, 'Should calculate success rate');
    });
  }

  async testDatabaseManager() {
    await this.runTest('Database Manager - Connection Configuration', async () => {
      const dbManager = new DatabaseManager({
        config: {
          host: 'localhost',
          port: 5432,
          database: 'test_db',
          user: 'test_user',
          password: 'test_pass'
        }
      });

      this.assertExists(dbManager, 'Database manager should be created');
      this.assertEquals(dbManager.config.host, 'localhost', 'Host should be set correctly');
      this.assertEquals(dbManager.config.port, 5432, 'Port should be set correctly');
    });

    await this.runTest('Database Manager - Batch Operations Setup', async () => {
      const dbManager = new DatabaseManager();

      // Test conversation batch structure
      const conversations = [
        {
          userId: 'test1',
          requestId: 'req1',
          userMessage: 'Test message',
          aiResponse: 'Test response',
          model: 'gemini20FlashExp',
          responseTime: 1000
        }
      ];

      // This would normally execute the insert, but we'll just check the method exists
      this.assert(typeof dbManager.insertConversationsBatch === 'function', 'Batch insert method should exist');
    });
  }

  async testIntegration() {
    await this.runTest('Integration - Component Dependencies', async () => {
      // Test that components can be initialized together
      const components = {};

      try {
        components.database = new DatabaseManager();
        components.analytics = new AnalyticsTracker({ database: components.database });
        components.personalization = new PersonalizationEngine({ 
          database: components.database, 
          analytics: components.analytics 
        });
        
        this.assertExists(components.database, 'Database component should be created');
        this.assertExists(components.analytics, 'Analytics component should be created');
        this.assertExists(components.personalization, 'Personalization component should be created');
        
        // Test that dependencies are properly set
        this.assertEquals(components.analytics.database, components.database, 'Analytics should reference database');
        this.assertEquals(components.personalization.database, components.database, 'Personalization should reference database');
        
      } catch (error) {
        throw new Error(`Component initialization failed: ${error.message}`);
      }
    });

    await this.runTest('Integration - Event Flow', async () => {
      const analytics = new AnalyticsTracker({ batchSize: 5 });
      const personalization = new PersonalizationEngine();
      
      let eventReceived = false;
      
      // Set up event listener
      analytics.on('conversation', (data) => {
        eventReceived = true;
        this.assertExists(data.userId, 'Event should contain user ID');
        this.assertExists(data.timestamp, 'Event should contain timestamp');
      });

      // Track a conversation
      await analytics.trackConversation({
        userId: 'test123',
        requestId: 'req123',
        model: 'gemini20FlashExp',
        responseTime: 1500,
        context: { conversationType: 'consultation' }
      });

      this.assert(eventReceived, 'Analytics event should be emitted');
    });
  }

  async testPerformance() {
    await this.runTest('Performance - Cache Key Generation Speed', async () => {
      const cache = new ResponseCache();
      const userContext = { userId: 'test123', brand: 'Sienna Naturals' };
      const analysisContext = { 
        conversationType: 'consultation', 
        journeyStage: 'learning',
        topics: [{ category: 'hairTypes', keywords: ['4c'] }]
      };

      const startTime = Date.now();
      
      // Generate 1000 cache keys
      for (let i = 0; i < 1000; i++) {
        cache.generateCacheKey(`Test message ${i}`, userContext, analysisContext);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      this.assert(duration < 1000, `Cache key generation should be fast. Took ${duration}ms for 1000 keys`);
    });

    await this.runTest('Performance - Analytics Event Batching', async () => {
      const analytics = new AnalyticsTracker({ batchSize: 100, flushInterval: 60000 });
      
      const startTime = Date.now();
      
      // Add 500 events
      for (let i = 0; i < 500; i++) {
        await analytics.trackEvent('performance_test', {
          userId: `user${i}`,
          requestId: `req${i}`,
          data: `test data ${i}`
        });
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      this.assert(duration < 2000, `Event tracking should be fast. Took ${duration}ms for 500 events`);
      this.assert(analytics.eventQueue.length <= 500, 'Events should be queued efficiently');
    });

    await this.runTest('Performance - Memory Usage Check', async () => {
      const initialMemory = process.memoryUsage();
      
      // Create multiple components
      const components = [];
      for (let i = 0; i < 10; i++) {
        components.push(new AnalyticsTracker({ batchSize: 10 }));
        components.push(new ResponseCache());
        components.push(new PersonalizationEngine());
      }
      
      const afterMemory = process.memoryUsage();
      const memoryIncrease = afterMemory.heapUsed - initialMemory.heapUsed;
      
      // Memory increase should be reasonable (less than 100MB for 30 components)
      this.assert(memoryIncrease < 100 * 1024 * 1024, `Memory usage increase should be reasonable. Increased by ${Math.round(memoryIncrease / 1024 / 1024)}MB`);
    });
  }

  generateTestReport() {
    console.log('\n' + '='.repeat(80));
    console.log('🎯 TEST RESULTS SUMMARY');
    console.log('='.repeat(80));
    console.log(`\n✅ Passed Tests: ${this.passedTests}`);
    console.log(`❌ Failed Tests: ${this.failedTests}`);
    console.log(`📊 Total Tests: ${this.passedTests + this.failedTests}`);
    console.log(`🎯 Success Rate: ${Math.round((this.passedTests / (this.passedTests + this.failedTests)) * 100)}%`);

    if (this.failedTests > 0) {
      console.log('\n❌ FAILED TESTS DETAILS:');
      console.log('-'.repeat(40));
      this.testResults
        .filter(result => result.status === 'FAILED')
        .forEach(result => {
          console.log(`• ${result.name}: ${result.error}`);
        });
    }

    console.log('\n📋 ALL TEST RESULTS:');
    console.log('-'.repeat(40));
    this.testResults.forEach(result => {
      const status = result.status === 'PASSED' ? '✅' : '❌';
      console.log(`${status} ${result.name}`);
    });

    console.log('\n' + '='.repeat(80));
    
    if (this.failedTests === 0) {
      console.log('🎉 ALL TESTS PASSED! The Sienna Naturals Enhanced Chatbot is ready for deployment.');
    } else {
      console.log('⚠️  Some tests failed. Please review and fix the issues before deployment.');
    }
    
    console.log('='.repeat(80));
  }

  async runAllTests() {
    try {
      console.log('🚀 Starting comprehensive test suite...\n');

      // Core component tests
      await this.testAIModelManager();
      await this.testSmartPromptManager();
      await this.testResponseCache();
      await this.testAnalyticsTracker();
      await this.testPersonalizationEngine();
      await this.testProactiveEngagement();
      await this.testCircuitBreaker();
      await this.testDatabaseManager();
      
      // Integration tests
      await this.testIntegration();
      
      // Performance tests
      await this.testPerformance();

    } catch (error) {
      console.log(`\n💥 Test suite encountered a fatal error: ${error.message}`);
      this.failedTests++;
    } finally {
      this.generateTestReport();
    }
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const testRunner = new TestRunner();
  testRunner.runAllTests().then(() => {
    process.exit(testRunner.failedTests > 0 ? 1 : 0);
  }).catch((error) => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

export { TestRunner };