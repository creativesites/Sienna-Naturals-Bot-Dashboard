import { Pool } from 'pg';
import winston from 'winston';

export class DatabaseManager {
  constructor(options = {}) {
    this.pool = null;
    this.connected = false;
    
    this.config = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'sienna_naturals_db',
      max: options.maxConnections || 20,
      idleTimeoutMillis: options.idleTimeout || 30000,
      connectionTimeoutMillis: options.connectionTimeout || 10000,
      ...options.config
    };

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      transports: [new winston.transports.Console()]
    });

    // Initialize connection pool
    this.initializePool();
  }

  initializePool() {
    this.pool = new Pool(this.config);

    this.pool.on('connect', () => {
      this.logger.debug('New database connection established');
    });

    this.pool.on('error', (error) => {
      this.logger.error('Database pool error:', error);
      this.connected = false;
    });

    this.pool.on('remove', () => {
      this.logger.debug('Database connection removed from pool');
    });
  }

  async connect() {
    try {
      // Test connection
      const client = await this.pool.connect();
      const result = await client.query('SELECT NOW()');
      client.release();
      
      this.connected = true;
      this.logger.info('Database connected successfully', {
        host: this.config.host,
        database: this.config.database,
        timestamp: result.rows[0].now
      });

      // Initialize schema if needed
      await this.initializeSchema();

    } catch (error) {
      this.logger.error('Database connection failed:', error);
      this.connected = false;
      throw error;
    }
  }

  async initializeSchema() {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Create enhanced tables for Sienna Naturals chatbot analytics
      await this.createAnalyticsTables(client);
      await this.createIndexes(client);
      await this.createMaterializedViews(client);
      
      await client.query('COMMIT');
      this.logger.info('Database schema initialized successfully');
      
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error('Schema initialization failed:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async createAnalyticsTables(client) {
    // Enhanced user profiles
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        user_id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        hair_type VARCHAR(50),
        hair_porosity VARCHAR(50),
        hair_density VARCHAR(50),
        primary_concerns TEXT[],
        hair_goals TEXT[],
        current_routine TEXT,
        product_allergies TEXT[],
        preferred_brands TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        brand VARCHAR(100) DEFAULT 'Sienna Naturals'
      );
    `);

    // Conversation tracking
    await client.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        conversation_id VARCHAR(255),
        user_id VARCHAR(255) NOT NULL,
        request_id VARCHAR(255) UNIQUE,
        user_message TEXT NOT NULL,
        ai_response TEXT NOT NULL,
        model_used VARCHAR(100),
        response_time_ms INTEGER,
        confidence_score DECIMAL(3,2),
        context_type VARCHAR(50),
        journey_stage VARCHAR(50),
        has_image BOOLEAN DEFAULT FALSE,
        was_cached BOOLEAN DEFAULT FALSE,
        satisfaction_score INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        brand VARCHAR(100) DEFAULT 'Sienna Naturals'
      );
    `);

    // Analytics events
    await client.query(`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id SERIAL PRIMARY KEY,
        event_type VARCHAR(100) NOT NULL,
        user_id VARCHAR(255),
        request_id VARCHAR(255),
        event_data JSONB,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        brand VARCHAR(100) DEFAULT 'Sienna Naturals'
      );
    `);

    // Error tracking
    await client.query(`
      CREATE TABLE IF NOT EXISTS error_logs (
        id SERIAL PRIMARY KEY,
        request_id VARCHAR(255),
        error_type VARCHAR(100),
        error_message TEXT,
        model VARCHAR(100),
        user_id VARCHAR(255),
        response_time_ms INTEGER,
        stack_trace TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        brand VARCHAR(100) DEFAULT 'Sienna Naturals'
      );
    `);

    // Hair journey tracking
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_journey_stages (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        stage VARCHAR(50) NOT NULL,
        previous_stage VARCHAR(50),
        stage_entered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        stage_duration_hours INTEGER,
        progression_score INTEGER,
        brand VARCHAR(100) DEFAULT 'Sienna Naturals'
      );
    `);

    // Brand-specific interactions
    await client.query(`
      CREATE TABLE IF NOT EXISTS brand_interactions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        brand VARCHAR(100) NOT NULL,
        interaction_type VARCHAR(100) NOT NULL,
        interaction_data JSONB,
        satisfaction_score INTEGER,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Product recommendations tracking
    await client.query(`
      CREATE TABLE IF NOT EXISTS product_recommendations (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        product_id VARCHAR(255),
        product_name VARCHAR(255) NOT NULL,
        recommendation_reason TEXT,
        context_data JSONB,
        user_hair_type VARCHAR(50),
        confidence_score DECIMAL(3,2),
        user_response VARCHAR(50), -- accepted, rejected, ignored
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        brand VARCHAR(100) DEFAULT 'Sienna Naturals'
      );
    `);

    // Store locator requests
    await client.query(`
      CREATE TABLE IF NOT EXISTS store_locator_requests (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255),
        location_query VARCHAR(255),
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8),
        stores_found INTEGER,
        stores_clicked TEXT[],
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        brand VARCHAR(100) DEFAULT 'Sienna Naturals'
      );
    `);

    // Circuit breaker states
    await client.query(`
      CREATE TABLE IF NOT EXISTS circuit_breaker_states (
        model_name VARCHAR(100) PRIMARY KEY,
        state VARCHAR(20) NOT NULL,
        failure_count INTEGER DEFAULT 0,
        last_failure_time TIMESTAMP,
        last_success_time TIMESTAMP,
        total_requests INTEGER DEFAULT 0,
        successful_requests INTEGER DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Response caching metrics
    await client.query(`
      CREATE TABLE IF NOT EXISTS response_cache (
        cache_key VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255),
        message_hash VARCHAR(255),
        response_data JSONB,
        hit_count INTEGER DEFAULT 0,
        last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP,
        brand VARCHAR(100) DEFAULT 'Sienna Naturals'
      );
    `);

    // Smart prompt analytics
    await client.query(`
      CREATE TABLE IF NOT EXISTS smart_prompt_analytics (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255),
        conversation_type VARCHAR(50),
        complexity VARCHAR(20),
        journey_stage VARCHAR(50),
        topic_count INTEGER,
        prompt_length INTEGER,
        urgency VARCHAR(20),
        sentiment VARCHAR(20),
        effectiveness_score DECIMAL(3,2),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // User engagement patterns
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_engagement_patterns (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        engagement_type VARCHAR(100),
        duration_seconds INTEGER,
        page_path VARCHAR(255),
        action_taken VARCHAR(100),
        engagement_value DECIMAL(10,2),
        device_type VARCHAR(50),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        brand VARCHAR(100) DEFAULT 'Sienna Naturals'
      );
    `);

    // Conversation metrics (aggregated)
    await client.query(`
      CREATE TABLE IF NOT EXISTS conversation_metrics (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        hour INTEGER,
        total_conversations INTEGER DEFAULT 0,
        unique_users INTEGER DEFAULT 0,
        average_response_time DECIMAL(8,2),
        cache_hit_rate DECIMAL(5,2),
        satisfaction_avg DECIMAL(3,2),
        model_usage JSONB,
        error_rate DECIMAL(5,2),
        brand VARCHAR(100) DEFAULT 'Sienna Naturals',
        UNIQUE(date, hour, brand)
      );
    `);

    // Personalization metrics
    await client.query(`
      CREATE TABLE IF NOT EXISTS personalization_metrics (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        personalization_type VARCHAR(100),
        effectiveness_score DECIMAL(3,2),
        user_feedback VARCHAR(50),
        context_data JSONB,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        brand VARCHAR(100) DEFAULT 'Sienna Naturals'
      );
    `);

    // Proactive campaigns
    await client.query(`
      CREATE TABLE IF NOT EXISTS proactive_campaigns (
        id SERIAL PRIMARY KEY,
        campaign_name VARCHAR(255) NOT NULL,
        campaign_type VARCHAR(100),
        target_criteria JSONB,
        message_template TEXT,
        trigger_conditions JSONB,
        success_metrics JSONB,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        brand VARCHAR(100) DEFAULT 'Sienna Naturals'
      );
    `);

    // A/B testing results
    await client.query(`
      CREATE TABLE IF NOT EXISTS ab_test_results (
        id SERIAL PRIMARY KEY,
        test_name VARCHAR(255) NOT NULL,
        variant VARCHAR(100) NOT NULL,
        user_id VARCHAR(255),
        outcome VARCHAR(100),
        outcome_value DECIMAL(10,2),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        brand VARCHAR(100) DEFAULT 'Sienna Naturals'
      );
    `);

    // Real-time metrics snapshot
    await client.query(`
      CREATE TABLE IF NOT EXISTS real_time_metrics (
        id SERIAL PRIMARY KEY,
        active_users INTEGER,
        total_conversations INTEGER,
        total_messages INTEGER,
        total_errors INTEGER,
        average_response_time INTEGER,
        cache_hit_rate DECIMAL(5,2),
        model_usage JSONB,
        uptime_ms BIGINT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        brand VARCHAR(100) DEFAULT 'Sienna Naturals'
      );
    `);
  }

  async createIndexes(client) {
    // Performance indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_conversations_model_used ON conversations(model_used)',
      'CREATE INDEX IF NOT EXISTS idx_conversations_brand ON conversations(brand)',
      
      'CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type)',
      'CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp)',
      'CREATE INDEX IF NOT EXISTS idx_analytics_events_brand ON analytics_events(brand)',
      
      'CREATE INDEX IF NOT EXISTS idx_error_logs_timestamp ON error_logs(timestamp)',
      'CREATE INDEX IF NOT EXISTS idx_error_logs_error_type ON error_logs(error_type)',
      'CREATE INDEX IF NOT EXISTS idx_error_logs_model ON error_logs(model)',
      
      'CREATE INDEX IF NOT EXISTS idx_user_journey_stages_user_id ON user_journey_stages(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_user_journey_stages_stage ON user_journey_stages(stage)',
      
      'CREATE INDEX IF NOT EXISTS idx_brand_interactions_user_id ON brand_interactions(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_brand_interactions_brand ON brand_interactions(brand)',
      'CREATE INDEX IF NOT EXISTS idx_brand_interactions_timestamp ON brand_interactions(timestamp)',
      
      'CREATE INDEX IF NOT EXISTS idx_product_recommendations_user_id ON product_recommendations(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_product_recommendations_brand ON product_recommendations(brand)',
      
      'CREATE INDEX IF NOT EXISTS idx_response_cache_user_id ON response_cache(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_response_cache_last_accessed ON response_cache(last_accessed)',
      
      'CREATE INDEX IF NOT EXISTS idx_user_engagement_user_id ON user_engagement_patterns(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_user_engagement_timestamp ON user_engagement_patterns(timestamp)',
      
      'CREATE INDEX IF NOT EXISTS idx_conversation_metrics_date ON conversation_metrics(date)',
      'CREATE INDEX IF NOT EXISTS idx_conversation_metrics_brand ON conversation_metrics(brand)'
    ];

    for (const indexSQL of indexes) {
      try {
        await client.query(indexSQL);
      } catch (error) {
        this.logger.warn('Index creation warning:', { sql: indexSQL, error: error.message });
      }
    }
  }

  async createMaterializedViews(client) {
    // Brand performance comparison view
    await client.query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS brand_performance_comparison AS
      SELECT 
        brand,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(*) as total_conversations,
        AVG(response_time_ms) as avg_response_time,
        AVG(satisfaction_score) as avg_satisfaction,
        COUNT(*) FILTER (WHERE was_cached = true) as cached_responses,
        DATE_TRUNC('day', created_at) as date
      FROM conversations 
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY brand, DATE_TRUNC('day', created_at);
    `);

    // Model performance view
    await client.query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS model_performance_stats AS
      SELECT 
        model_used,
        COUNT(*) as total_requests,
        AVG(response_time_ms) as avg_response_time,
        AVG(confidence_score) as avg_confidence,
        COUNT(*) FILTER (WHERE satisfaction_score >= 4) as high_satisfaction_count,
        DATE_TRUNC('hour', created_at) as hour_bucket
      FROM conversations 
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
        AND model_used IS NOT NULL
      GROUP BY model_used, DATE_TRUNC('hour', created_at);
    `);

    // User journey progression view
    await client.query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS user_journey_progression AS
      SELECT 
        stage,
        COUNT(DISTINCT user_id) as users_in_stage,
        AVG(stage_duration_hours) as avg_duration_hours,
        COUNT(*) FILTER (WHERE progression_score > 0) as progressing_users,
        brand
      FROM user_journey_stages 
      WHERE stage_entered_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY stage, brand;
    `);

    // Cache performance view
    await client.query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS cache_performance_stats AS
      SELECT 
        brand,
        COUNT(*) as total_cached_responses,
        SUM(hit_count) as total_hits,
        AVG(hit_count) as avg_hits_per_response,
        COUNT(*) FILTER (WHERE last_accessed >= CURRENT_DATE - INTERVAL '1 day') as active_cache_entries,
        (SUM(hit_count)::DECIMAL / COUNT(*)) * 100 as cache_utilization_rate
      FROM response_cache 
      GROUP BY brand;
    `);

    // Circuit breaker status view
    await client.query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS model_circuit_breaker_status AS
      SELECT 
        model_name,
        state,
        CASE 
          WHEN state = 'closed' THEN '🟢 Healthy'
          WHEN state = 'half-open' THEN '🟡 Testing'
          WHEN state = 'open' THEN '🔴 Failed'
          ELSE '⚪ Unknown'
        END as status_indicator,
        failure_count,
        (successful_requests::DECIMAL / NULLIF(total_requests, 0)) * 100 as success_rate,
        last_failure_time,
        last_success_time
      FROM circuit_breaker_states;
    `);
  }

  // Core database operations

  async getUserInfo(userId) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM user_profiles WHERE user_id = $1',
        [userId]
      );
      return result.rows[0] || null;
    } catch (error) {
      this.logger.error('Error getting user info:', error);
      return null;
    } finally {
      client.release();
    }
  }

  async createUserProfile(userId, profileData) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        INSERT INTO user_profiles (
          user_id, name, email, hair_type, hair_porosity, hair_density,
          primary_concerns, hair_goals, current_routine, product_allergies,
          preferred_brands, brand
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (user_id) DO UPDATE SET
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [
        userId,
        profileData.name || null,
        profileData.email || null,
        profileData.hairType || null,
        profileData.hairPorosity || null,
        profileData.hairDensity || null,
        profileData.primaryConcerns || [],
        profileData.hairGoals || [],
        profileData.currentRoutine || null,
        profileData.productAllergies || [],
        profileData.preferredBrands || [],
        profileData.brand || 'Sienna Naturals'
      ]);
      
      return result.rows[0];
    } catch (error) {
      this.logger.error('Error creating user profile:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async saveConversation(conversationData) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        INSERT INTO conversations (
          conversation_id, user_id, request_id, user_message, ai_response,
          model_used, response_time_ms, confidence_score, context_type,
          journey_stage, has_image, was_cached, brand
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id
      `, [
        conversationData.conversationId || conversationData.requestId,
        conversationData.userId,
        conversationData.requestId,
        conversationData.userMessage,
        conversationData.aiResponse,
        conversationData.model,
        conversationData.responseTime,
        conversationData.confidence || null,
        conversationData.context?.conversationType || null,
        conversationData.context?.journeyStage || null,
        conversationData.imageUrl ? true : false,
        conversationData.cached || false,
        'Sienna Naturals'
      ]);
      
      return result.rows[0].id;
    } catch (error) {
      this.logger.error('Error saving conversation:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async getAllChatsSummary(userId, limit = 10) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        SELECT user_message, ai_response, created_at
        FROM conversations 
        WHERE user_id = $1 
        ORDER BY created_at DESC 
        LIMIT $2
      `, [userId, limit]);
      
      if (result.rows.length === 0) return '';
      
      return result.rows.map(row => 
        `User: ${row.user_message.substring(0, 100)}\nAI: ${row.ai_response.substring(0, 100)}`
      ).join('\n---\n');
      
    } catch (error) {
      this.logger.error('Error getting chats summary:', error);
      return '';
    } finally {
      client.release();
    }
  }

  // Batch operations for analytics

  async insertConversationsBatch(conversations) {
    if (conversations.length === 0) return;
    
    const client = await this.pool.connect();
    try {
      const values = conversations.map((conv, index) => {
        const baseIndex = index * 13;
        return `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5}, $${baseIndex + 6}, $${baseIndex + 7}, $${baseIndex + 8}, $${baseIndex + 9}, $${baseIndex + 10}, $${baseIndex + 11}, $${baseIndex + 12}, $${baseIndex + 13})`;
      }).join(', ');
      
      const flatValues = conversations.flatMap(conv => [
        conv.conversationId || conv.requestId,
        conv.userId,
        conv.requestId,
        conv.userMessage || 'Batch conversation',
        conv.aiResponse || 'Batch response',
        conv.model,
        conv.responseTime,
        conv.confidence || null,
        conv.context?.conversationType || null,
        conv.context?.journeyStage || null,
        conv.hasImage || false,
        conv.cached || false,
        conv.brand || 'Sienna Naturals'
      ]);

      await client.query(`
        INSERT INTO conversations (
          conversation_id, user_id, request_id, user_message, ai_response,
          model_used, response_time_ms, confidence_score, context_type,
          journey_stage, has_image, was_cached, brand
        ) VALUES ${values}
        ON CONFLICT (request_id) DO NOTHING
      `, flatValues);
      
    } catch (error) {
      this.logger.error('Error inserting conversations batch:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async insertEventsBatch(events) {
    if (events.length === 0) return;
    
    const client = await this.pool.connect();
    try {
      const values = events.map((event, index) => {
        const baseIndex = index * 6;
        return `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5}, $${baseIndex + 6})`;
      }).join(', ');
      
      const flatValues = events.flatMap(event => [
        event.eventType,
        event.userId || null,
        event.requestId || null,
        event.data || '{}',
        event.timestamp,
        event.brand || 'Sienna Naturals'
      ]);

      await client.query(`
        INSERT INTO analytics_events (
          event_type, user_id, request_id, event_data, timestamp, brand
        ) VALUES ${values}
      `, flatValues);
      
    } catch (error) {
      this.logger.error('Error inserting events batch:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async insertErrorsBatch(errors) {
    if (errors.length === 0) return;
    
    const client = await this.pool.connect();
    try {
      const values = errors.map((error, index) => {
        const baseIndex = index * 9;
        return `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5}, $${baseIndex + 6}, $${baseIndex + 7}, $${baseIndex + 8}, $${baseIndex + 9})`;
      }).join(', ');
      
      const flatValues = errors.flatMap(error => [
        error.requestId || null,
        error.errorType || 'unknown',
        error.errorMessage || error.error || 'Unknown error',
        error.model || null,
        error.userId || null,
        error.responseTime || null,
        error.stackTrace || null,
        error.timestamp,
        error.brand || 'Sienna Naturals'
      ]);

      await client.query(`
        INSERT INTO error_logs (
          request_id, error_type, error_message, model, user_id,
          response_time_ms, stack_trace, timestamp, brand
        ) VALUES ${values}
      `, flatValues);
      
    } catch (error) {
      this.logger.error('Error inserting errors batch:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Health and connection management

  isConnected() {
    return this.connected && this.pool && !this.pool.ended;
  }

  async disconnect() {
    try {
      if (this.pool) {
        await this.pool.end();
        this.connected = false;
        this.logger.info('Database disconnected successfully');
      }
    } catch (error) {
      this.logger.error('Error disconnecting from database:', error);
      throw error;
    }
  }

  async healthCheck() {
    try {
      const client = await this.pool.connect();
      const result = await client.query('SELECT 1 as healthy, NOW() as timestamp');
      client.release();
      
      return {
        healthy: true,
        timestamp: result.rows[0].timestamp,
        connectionPool: {
          totalCount: this.pool.totalCount,
          idleCount: this.pool.idleCount,
          waitingCount: this.pool.waitingCount
        }
      };
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      return {
        healthy: false,
        error: error.message
      };
    }
  }
}