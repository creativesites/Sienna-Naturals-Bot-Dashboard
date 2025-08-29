-- Sienna Naturals Enhanced Chatbot Database Schema Migration
-- Version: 3.0.0
-- Description: Complete database schema for enterprise-grade chatbot with analytics

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- CORE USER AND CONVERSATION TABLES
-- ============================================================================

-- Enhanced user profiles with comprehensive hair care data
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    date_of_birth DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_interaction TIMESTAMP,
    
    -- Hair characteristics
    hair_type VARCHAR(50), -- 1a, 1b, 1c, 2a, 2b, 2c, 3a, 3b, 3c, 4a, 4b, 4c
    hair_porosity VARCHAR(50), -- low, normal, high
    hair_density VARCHAR(50), -- low, medium, high
    hair_elasticity VARCHAR(50), -- low, normal, high
    scalp_type VARCHAR(50), -- normal, oily, dry, sensitive
    
    -- Hair concerns and goals (stored as arrays)
    primary_concerns TEXT[],
    secondary_concerns TEXT[],
    hair_goals TEXT[],
    
    -- Current routine and products
    current_routine TEXT,
    current_products JSONB,
    product_allergies TEXT[],
    ingredient_sensitivities TEXT[],
    preferred_brands TEXT[],
    budget_range VARCHAR(50),
    
    -- Journey and preferences
    journey_stage VARCHAR(50) DEFAULT 'discovery',
    experience_level VARCHAR(50) DEFAULT 'beginner',
    time_availability VARCHAR(50), -- low, medium, high
    styling_preferences TEXT[],
    
    -- Demographics and context
    location_city VARCHAR(100),
    location_state VARCHAR(100),
    location_country VARCHAR(100) DEFAULT 'US',
    climate_type VARCHAR(50), -- humid, dry, temperate, tropical
    water_hardness VARCHAR(50), -- soft, medium, hard
    
    -- Engagement preferences  
    communication_style VARCHAR(50) DEFAULT 'balanced', -- concise, detailed, balanced
    preferred_response_length VARCHAR(50) DEFAULT 'medium',
    notification_preferences JSONB,
    
    -- Brand and source tracking
    brand VARCHAR(100) DEFAULT 'Sienna Naturals',
    acquisition_source VARCHAR(100),
    referral_code VARCHAR(50),
    
    -- Privacy and consent
    privacy_consent BOOLEAN DEFAULT false,
    marketing_consent BOOLEAN DEFAULT false,
    data_sharing_consent BOOLEAN DEFAULT false
);

-- Conversation tracking with enhanced context
CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    conversation_id VARCHAR(255),
    user_id VARCHAR(255) NOT NULL,
    request_id VARCHAR(255) UNIQUE NOT NULL,
    
    -- Message content
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text', -- text, image, voice, video
    
    -- AI model and processing
    model_used VARCHAR(100),
    model_version VARCHAR(50),
    response_time_ms INTEGER,
    processing_tokens INTEGER,
    confidence_score DECIMAL(3,2),
    fallback_used BOOLEAN DEFAULT false,
    
    -- Context and classification
    context_type VARCHAR(50), -- consultation, troubleshooting, education, shopping
    conversation_stage VARCHAR(50), -- greeting, information_gathering, recommendation, followup
    journey_stage VARCHAR(50),
    complexity_level VARCHAR(20), -- low, medium, high
    urgency_level VARCHAR(20) DEFAULT 'normal', -- low, normal, high
    sentiment VARCHAR(20), -- positive, negative, neutral
    
    -- Content analysis
    topics_identified TEXT[],
    intent_detected VARCHAR(100),
    entities_extracted JSONB,
    language_detected VARCHAR(10) DEFAULT 'en',
    
    -- Interaction quality
    has_image BOOLEAN DEFAULT false,
    image_analysis_results JSONB,
    was_cached BOOLEAN DEFAULT false,
    cache_key VARCHAR(255),
    user_satisfaction_score INTEGER, -- 1-5 scale
    user_feedback TEXT,
    
    -- Session and flow
    session_id VARCHAR(255),
    message_sequence INTEGER DEFAULT 1,
    parent_message_id INTEGER,
    follow_up_needed BOOLEAN DEFAULT false,
    
    -- Personalization applied
    personalization_applied JSONB,
    persona_identified VARCHAR(50),
    response_adjustments TEXT[],
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    brand VARCHAR(100) DEFAULT 'Sienna Naturals',
    device_type VARCHAR(50),
    user_agent TEXT,
    ip_address INET,
    
    -- Constraints
    FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    CHECK (confidence_score >= 0 AND confidence_score <= 1),
    CHECK (user_satisfaction_score >= 1 AND user_satisfaction_score <= 5)
);

-- ============================================================================
-- ANALYTICS AND TRACKING TABLES
-- ============================================================================

-- Comprehensive analytics events
CREATE TABLE IF NOT EXISTS analytics_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    event_category VARCHAR(50),
    event_action VARCHAR(100),
    
    -- User and session context
    user_id VARCHAR(255),
    session_id VARCHAR(255),
    request_id VARCHAR(255),
    conversation_id VARCHAR(255),
    
    -- Event data and metadata
    event_data JSONB,
    event_value DECIMAL(10,2),
    custom_properties JSONB,
    
    -- Context
    page_url TEXT,
    referrer_url TEXT,
    user_agent TEXT,
    device_info JSONB,
    location_info JSONB,
    
    -- Timing
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_duration_seconds INTEGER,
    time_on_page_seconds INTEGER,
    
    -- Attribution
    brand VARCHAR(100) DEFAULT 'Sienna Naturals',
    campaign_id VARCHAR(100),
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    
    -- Indexing hints
    FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE SET NULL
);

-- Error tracking and monitoring
CREATE TABLE IF NOT EXISTS error_logs (
    id SERIAL PRIMARY KEY,
    error_id VARCHAR(255) UNIQUE DEFAULT gen_random_uuid(),
    
    -- Request context
    request_id VARCHAR(255),
    user_id VARCHAR(255),
    session_id VARCHAR(255),
    
    -- Error details
    error_type VARCHAR(100) NOT NULL,
    error_category VARCHAR(50),
    error_message TEXT NOT NULL,
    error_code VARCHAR(50),
    
    -- Technical details
    stack_trace TEXT,
    model VARCHAR(100),
    component VARCHAR(100),
    function_name VARCHAR(100),
    line_number INTEGER,
    
    -- Request details
    response_time_ms INTEGER,
    request_size_bytes INTEGER,
    memory_usage_mb DECIMAL(8,2),
    cpu_usage_percent DECIMAL(5,2),
    
    -- Resolution tracking
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP,
    resolved_by VARCHAR(255),
    resolution_notes TEXT,
    
    -- Environment
    environment VARCHAR(50) DEFAULT 'production',
    server_id VARCHAR(100),
    deployment_version VARCHAR(50),
    
    -- Timing and metadata
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    brand VARCHAR(100) DEFAULT 'Sienna Naturals',
    
    -- Severity and impact
    severity_level VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
    user_impact VARCHAR(20) DEFAULT 'none', -- none, low, medium, high
    business_impact VARCHAR(20) DEFAULT 'none',
    
    FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE SET NULL
);

-- ============================================================================
-- HAIR JOURNEY AND PERSONALIZATION
-- ============================================================================

-- User journey stage tracking with transitions
CREATE TABLE IF NOT EXISTS user_journey_stages (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    
    -- Stage information
    stage VARCHAR(50) NOT NULL,
    previous_stage VARCHAR(50),
    stage_index INTEGER, -- 0-7 for linear progression tracking
    
    -- Timing and duration
    stage_entered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    stage_duration_hours INTEGER,
    expected_duration_hours INTEGER,
    
    -- Progress and scoring
    progression_score INTEGER DEFAULT 0, -- -10 to +10, negative means regression
    confidence_in_stage DECIMAL(3,2) DEFAULT 0.5,
    readiness_for_next_stage DECIMAL(3,2) DEFAULT 0.0,
    
    -- Context and triggers
    transition_trigger VARCHAR(100), -- user_action, time_based, ai_recommendation, manual
    transition_reason TEXT,
    milestone_achieved VARCHAR(100),
    
    -- Success metrics
    satisfaction_in_stage DECIMAL(3,2),
    engagement_level DECIMAL(3,2),
    knowledge_gained TEXT[],
    skills_developed TEXT[],
    
    -- Metadata
    brand VARCHAR(100) DEFAULT 'Sienna Naturals',
    notes TEXT,
    
    FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE
);

-- Brand-specific interaction tracking
CREATE TABLE IF NOT EXISTS brand_interactions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    
    -- Interaction details
    interaction_type VARCHAR(100) NOT NULL, -- consultation, product_view, purchase_intent, etc.
    interaction_category VARCHAR(50),
    interaction_value DECIMAL(10,2),
    
    -- Content and context
    interaction_data JSONB,
    content_engaged_with TEXT,
    duration_seconds INTEGER,
    
    -- Outcomes and satisfaction
    satisfaction_score INTEGER, -- 1-5 scale
    conversion_occurred BOOLEAN DEFAULT false,
    conversion_type VARCHAR(50),
    conversion_value DECIMAL(10,2),
    
    -- Attribution
    touch_point VARCHAR(100), -- chatbot, website, email, social, etc.
    campaign_id VARCHAR(100),
    referral_source VARCHAR(100),
    
    -- Metadata
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    device_type VARCHAR(50),
    location_data JSONB,
    
    FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE
);

-- ============================================================================
-- PRODUCT AND RECOMMENDATION TRACKING
-- ============================================================================

-- Product recommendations with comprehensive tracking
CREATE TABLE IF NOT EXISTS product_recommendations (
    id SERIAL PRIMARY KEY,
    recommendation_id VARCHAR(255) UNIQUE DEFAULT gen_random_uuid(),
    
    -- User and context
    user_id VARCHAR(255) NOT NULL,
    conversation_id VARCHAR(255),
    request_id VARCHAR(255),
    
    -- Product details
    product_id VARCHAR(255),
    product_name VARCHAR(255) NOT NULL,
    product_category VARCHAR(100),
    product_type VARCHAR(50),
    product_url TEXT,
    product_price DECIMAL(10,2),
    
    -- Recommendation context
    recommendation_reason TEXT,
    recommendation_confidence DECIMAL(3,2),
    recommendation_algorithm VARCHAR(50), -- ai_generated, rule_based, collaborative, content_based
    
    -- User context at time of recommendation
    user_hair_type VARCHAR(50),
    user_concerns TEXT[],
    user_goals TEXT[],
    user_budget_range VARCHAR(50),
    user_journey_stage VARCHAR(50),
    
    -- Contextual factors
    seasonal_factor BOOLEAN DEFAULT false,
    weather_factor VARCHAR(50),
    special_occasion VARCHAR(100),
    usage_frequency VARCHAR(50), -- daily, weekly, monthly, occasional
    
    -- User response and engagement
    user_response VARCHAR(50), -- interested, not_interested, purchased, saved, ignored
    user_feedback TEXT,
    clicked BOOLEAN DEFAULT false,
    clicked_at TIMESTAMP,
    
    -- Conversion tracking
    converted BOOLEAN DEFAULT false,
    converted_at TIMESTAMP,
    conversion_value DECIMAL(10,2),
    conversion_source VARCHAR(50),
    
    -- Follow-up and lifecycle
    follow_up_sent BOOLEAN DEFAULT false,
    follow_up_response VARCHAR(50),
    recommendation_status VARCHAR(50) DEFAULT 'active', -- active, expired, converted, rejected
    
    -- A/B testing
    test_variant VARCHAR(50),
    test_group VARCHAR(50),
    
    -- Metadata
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    brand VARCHAR(100) DEFAULT 'Sienna Naturals',
    expires_at TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE
);

-- Store locator requests and interactions
CREATE TABLE IF NOT EXISTS store_locator_requests (
    id SERIAL PRIMARY KEY,
    request_id VARCHAR(255) UNIQUE DEFAULT gen_random_uuid(),
    
    -- User context
    user_id VARCHAR(255),
    session_id VARCHAR(255),
    
    -- Location query
    location_query VARCHAR(255) NOT NULL,
    normalized_location VARCHAR(255),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    search_radius_miles INTEGER DEFAULT 25,
    
    -- Results and interaction
    stores_found INTEGER,
    stores_data JSONB,
    stores_clicked TEXT[], -- Array of store IDs clicked
    stores_called TEXT[], -- Array of store IDs called
    stores_visited TEXT[], -- Array of store IDs visited (if tracked)
    
    -- User experience
    result_quality_score INTEGER, -- 1-5 scale
    found_desired_store BOOLEAN,
    user_feedback TEXT,
    
    -- Context and filters
    product_seeking VARCHAR(255),
    service_seeking VARCHAR(255),
    preferred_store_features TEXT[],
    accessibility_needs TEXT[],
    
    -- Conversion tracking
    store_visit_occurred BOOLEAN DEFAULT false,
    purchase_made BOOLEAN DEFAULT false,
    purchase_value DECIMAL(10,2),
    
    -- Metadata
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    brand VARCHAR(100) DEFAULT 'Sienna Naturals',
    ip_address INET,
    user_agent TEXT,
    
    FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE SET NULL
);

-- ============================================================================
-- AI MODEL AND SYSTEM MONITORING
-- ============================================================================

-- Circuit breaker states for AI models
CREATE TABLE IF NOT EXISTS circuit_breaker_states (
    model_name VARCHAR(100) PRIMARY KEY,
    
    -- State tracking
    state VARCHAR(20) NOT NULL DEFAULT 'closed', -- closed, open, half-open
    failure_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    total_requests INTEGER DEFAULT 0,
    
    -- Timing
    last_failure_time TIMESTAMP,
    last_success_time TIMESTAMP,
    state_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    next_attempt_time TIMESTAMP,
    
    -- Configuration
    failure_threshold INTEGER DEFAULT 5,
    reset_timeout_ms INTEGER DEFAULT 60000,
    monitor_timeout_ms INTEGER DEFAULT 10000,
    
    -- Performance metrics
    average_response_time_ms INTEGER,
    min_response_time_ms INTEGER,
    max_response_time_ms INTEGER,
    success_rate DECIMAL(5,2),
    
    -- Health indicators
    is_healthy BOOLEAN DEFAULT true,
    health_check_last_run TIMESTAMP,
    health_check_next_run TIMESTAMP,
    consecutive_failures INTEGER DEFAULT 0,
    consecutive_successes INTEGER DEFAULT 0,
    
    -- Metadata
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    environment VARCHAR(50) DEFAULT 'production',
    
    CHECK (state IN ('closed', 'open', 'half-open')),
    CHECK (success_rate >= 0 AND success_rate <= 100)
);

-- Response caching with intelligent management
CREATE TABLE IF NOT EXISTS response_cache (
    cache_key VARCHAR(255) PRIMARY KEY,
    
    -- Content
    response_data JSONB NOT NULL,
    compressed_response BYTEA,
    content_hash VARCHAR(64),
    
    -- Context
    user_id VARCHAR(255),
    message_hash VARCHAR(255),
    context_hash VARCHAR(255),
    
    -- Usage statistics
    hit_count INTEGER DEFAULT 0,
    miss_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    access_frequency DECIMAL(8,4) DEFAULT 0,
    
    -- Lifecycle
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    
    -- Quality and relevance
    relevance_score DECIMAL(3,2) DEFAULT 1.0,
    freshness_score DECIMAL(3,2) DEFAULT 1.0,
    popularity_score DECIMAL(3,2) DEFAULT 0.0,
    
    -- Configuration
    ttl_seconds INTEGER,
    is_compressed BOOLEAN DEFAULT false,
    compression_ratio DECIMAL(5,2),
    
    -- Categorization
    response_category VARCHAR(50),
    user_segment VARCHAR(50),
    brand VARCHAR(100) DEFAULT 'Sienna Naturals',
    
    -- Performance
    generation_time_ms INTEGER,
    size_bytes INTEGER,
    
    FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE SET NULL
);

-- ============================================================================
-- ADVANCED ANALYTICS AND INTELLIGENCE
-- ============================================================================

-- Smart prompt analytics for optimization
CREATE TABLE IF NOT EXISTS smart_prompt_analytics (
    id SERIAL PRIMARY KEY,
    prompt_id VARCHAR(255) DEFAULT gen_random_uuid(),
    
    -- User and conversation context
    user_id VARCHAR(255),
    conversation_id VARCHAR(255),
    request_id VARCHAR(255),
    
    -- Prompt characteristics
    conversation_type VARCHAR(50),
    complexity VARCHAR(20),
    journey_stage VARCHAR(50),
    urgency VARCHAR(20),
    sentiment VARCHAR(20),
    
    -- Content analysis
    topic_count INTEGER,
    entity_count INTEGER,
    keyword_density DECIMAL(5,4),
    readability_score DECIMAL(5,2),
    
    -- Prompt construction
    prompt_template VARCHAR(100),
    prompt_length INTEGER,
    context_tokens INTEGER,
    user_history_tokens INTEGER,
    personalization_tokens INTEGER,
    
    -- Performance metrics
    effectiveness_score DECIMAL(3,2), -- Based on user satisfaction and engagement
    response_quality_score DECIMAL(3,2),
    response_time_ms INTEGER,
    tokens_generated INTEGER,
    
    -- Model performance
    model_used VARCHAR(100),
    model_confidence DECIMAL(3,2),
    fallback_triggered BOOLEAN DEFAULT false,
    cache_hit BOOLEAN DEFAULT false,
    
    -- User feedback
    user_satisfaction INTEGER, -- 1-5 scale
    user_engagement_score DECIMAL(3,2),
    conversation_continued BOOLEAN DEFAULT false,
    follow_up_questions INTEGER DEFAULT 0,
    
    -- Optimization tracking
    prompt_version VARCHAR(20),
    ab_test_group VARCHAR(50),
    optimization_applied TEXT[],
    
    -- Metadata
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    brand VARCHAR(100) DEFAULT 'Sienna Naturals',
    
    FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE SET NULL
);

-- User engagement patterns for personalization
CREATE TABLE IF NOT EXISTS user_engagement_patterns (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    
    -- Engagement type and context
    engagement_type VARCHAR(100) NOT NULL,
    engagement_category VARCHAR(50),
    engagement_context JSONB,
    
    -- Measurement
    duration_seconds INTEGER,
    interaction_count INTEGER DEFAULT 1,
    engagement_value DECIMAL(10,2),
    quality_score DECIMAL(3,2),
    
    -- Content and location
    content_type VARCHAR(50),
    content_id VARCHAR(255),
    page_path VARCHAR(255),
    section VARCHAR(100),
    
    -- User action details
    action_taken VARCHAR(100),
    action_sequence INTEGER,
    action_outcome VARCHAR(50),
    conversion_attributed BOOLEAN DEFAULT false,
    
    -- Device and technical context
    device_type VARCHAR(50),
    browser_type VARCHAR(50),
    screen_resolution VARCHAR(20),
    connection_speed VARCHAR(20),
    
    -- Behavioral insights
    attention_span_seconds INTEGER,
    scroll_depth_percent INTEGER,
    click_accuracy DECIMAL(3,2),
    task_completion BOOLEAN DEFAULT false,
    
    -- Temporal patterns
    time_of_day INTEGER, -- 0-23 hour
    day_of_week INTEGER, -- 1-7
    is_weekend BOOLEAN DEFAULT false,
    is_holiday BOOLEAN DEFAULT false,
    
    -- Attribution
    traffic_source VARCHAR(100),
    campaign_attribution JSONB,
    referral_context VARCHAR(255),
    
    -- Metadata
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    brand VARCHAR(100) DEFAULT 'Sienna Naturals',
    session_id VARCHAR(255),
    
    FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE
);

-- ============================================================================
-- AGGREGATED METRICS AND REPORTING
-- ============================================================================

-- Hourly conversation metrics for real-time dashboards
CREATE TABLE IF NOT EXISTS conversation_metrics (
    id SERIAL PRIMARY KEY,
    
    -- Time dimension
    date DATE NOT NULL,
    hour INTEGER NOT NULL, -- 0-23
    time_bucket TIMESTAMP NOT NULL,
    
    -- Volume metrics
    total_conversations INTEGER DEFAULT 0,
    unique_users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    returning_users INTEGER DEFAULT 0,
    
    -- Performance metrics
    average_response_time DECIMAL(8,2),
    median_response_time DECIMAL(8,2),
    p95_response_time DECIMAL(8,2),
    
    -- Quality metrics
    cache_hit_rate DECIMAL(5,2),
    satisfaction_avg DECIMAL(3,2),
    satisfaction_distribution JSONB, -- {1: count, 2: count, ...}
    
    -- AI model usage
    model_usage JSONB, -- {"gemini20FlashExp": count, "gemini15Flash": count, ...}
    model_performance JSONB, -- {"gemini20FlashExp": {avg_time: X, success_rate: Y}, ...}
    fallback_rate DECIMAL(5,2),
    
    -- Error and reliability metrics
    error_rate DECIMAL(5,2),
    error_types JSONB,
    circuit_breaker_events INTEGER DEFAULT 0,
    
    -- Engagement metrics
    conversation_depth_avg DECIMAL(5,2),
    follow_up_rate DECIMAL(5,2),
    session_duration_avg INTEGER,
    
    -- Content metrics
    image_analysis_requests INTEGER DEFAULT 0,
    complex_queries INTEGER DEFAULT 0,
    personalization_applied INTEGER DEFAULT 0,
    
    -- Business metrics
    product_recommendations INTEGER DEFAULT 0,
    conversion_events INTEGER DEFAULT 0,
    revenue_attributed DECIMAL(10,2),
    
    -- Metadata
    brand VARCHAR(100) DEFAULT 'Sienna Naturals',
    data_quality_score DECIMAL(3,2) DEFAULT 1.0,
    
    UNIQUE(date, hour, brand)
);

-- Personalization effectiveness metrics
CREATE TABLE IF NOT EXISTS personalization_metrics (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    
    -- Personalization details
    personalization_type VARCHAR(100) NOT NULL,
    personalization_strategy VARCHAR(50),
    personalization_context JSONB,
    
    -- Effectiveness measurement
    effectiveness_score DECIMAL(3,2),
    improvement_over_baseline DECIMAL(5,2),
    confidence_interval JSONB,
    
    -- User response
    user_feedback VARCHAR(50),
    user_satisfaction_delta DECIMAL(3,2),
    engagement_lift DECIMAL(5,2),
    
    -- Context and targeting
    user_segment VARCHAR(50),
    persona_identified VARCHAR(50),
    journey_stage_at_time VARCHAR(50),
    
    -- Content impact
    content_relevance_score DECIMAL(3,2),
    content_engagement_rate DECIMAL(5,2),
    response_length_optimization DECIMAL(5,2),
    
    -- Behavioral outcomes
    conversation_extension_rate DECIMAL(3,2),
    follow_up_question_rate DECIMAL(3,2),
    recommendation_acceptance_rate DECIMAL(3,2),
    
    -- A/B testing context
    test_group VARCHAR(50),
    control_group_comparison JSONB,
    statistical_significance DECIMAL(5,4),
    
    -- Metadata
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    brand VARCHAR(100) DEFAULT 'Sienna Naturals',
    measurement_period_days INTEGER DEFAULT 1,
    
    FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE
);

-- ============================================================================
-- PROACTIVE ENGAGEMENT AND CAMPAIGNS
-- ============================================================================

-- Proactive engagement campaigns and triggers
CREATE TABLE IF NOT EXISTS proactive_campaigns (
    id SERIAL PRIMARY KEY,
    campaign_id VARCHAR(255) UNIQUE DEFAULT gen_random_uuid(),
    
    -- Campaign details
    campaign_name VARCHAR(255) NOT NULL,
    campaign_type VARCHAR(100) NOT NULL,
    campaign_description TEXT,
    campaign_objective VARCHAR(100),
    
    -- Targeting and triggers
    target_criteria JSONB NOT NULL,
    trigger_conditions JSONB NOT NULL,
    exclusion_criteria JSONB,
    
    -- Message content
    message_template TEXT NOT NULL,
    message_variants JSONB,
    personalization_rules JSONB,
    
    -- Scheduling and frequency
    is_active BOOLEAN DEFAULT true,
    start_date DATE,
    end_date DATE,
    max_frequency VARCHAR(50), -- daily, weekly, monthly
    cooldown_hours INTEGER DEFAULT 24,
    
    -- Success metrics and goals
    success_metrics JSONB,
    target_engagement_rate DECIMAL(5,2),
    target_conversion_rate DECIMAL(5,2),
    target_satisfaction_score DECIMAL(3,2),
    
    -- Performance tracking
    total_sent INTEGER DEFAULT 0,
    total_delivered INTEGER DEFAULT 0,
    total_opened INTEGER DEFAULT 0,
    total_clicked INTEGER DEFAULT 0,
    total_conversions INTEGER DEFAULT 0,
    
    -- A/B testing
    ab_testing_enabled BOOLEAN DEFAULT false,
    test_variants JSONB,
    test_allocation JSONB,
    
    -- Approval and governance
    created_by VARCHAR(255),
    approved_by VARCHAR(255),
    approval_status VARCHAR(50) DEFAULT 'draft',
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    brand VARCHAR(100) DEFAULT 'Sienna Naturals',
    priority INTEGER DEFAULT 5, -- 1-10 scale
    
    CHECK (approval_status IN ('draft', 'pending', 'approved', 'rejected', 'paused'))
);

-- Individual proactive engagement logs
CREATE TABLE IF NOT EXISTS proactive_engagements (
    id SERIAL PRIMARY KEY,
    engagement_id VARCHAR(255) UNIQUE DEFAULT gen_random_uuid(),
    
    -- Campaign and user
    campaign_id VARCHAR(255),
    user_id VARCHAR(255) NOT NULL,
    
    -- Trigger details
    trigger_name VARCHAR(100) NOT NULL,
    trigger_reason TEXT,
    trigger_score DECIMAL(3,2),
    trigger_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Message details
    message_type VARCHAR(50) NOT NULL,
    message_content TEXT NOT NULL,
    message_variant VARCHAR(50),
    personalization_applied JSONB,
    
    -- Delivery
    delivery_method VARCHAR(50), -- chatbot, email, push, sms
    scheduled_time TIMESTAMP,
    delivered_time TIMESTAMP,
    delivery_status VARCHAR(50) DEFAULT 'pending',
    
    -- User response
    opened BOOLEAN DEFAULT false,
    opened_at TIMESTAMP,
    clicked BOOLEAN DEFAULT false,
    clicked_at TIMESTAMP,
    responded BOOLEAN DEFAULT false,
    responded_at TIMESTAMP,
    response_content TEXT,
    
    -- Engagement outcomes
    engagement_score DECIMAL(3,2),
    satisfaction_feedback INTEGER, -- 1-5 scale
    conversion_occurred BOOLEAN DEFAULT false,
    conversion_type VARCHAR(50),
    conversion_value DECIMAL(10,2),
    
    -- Context
    user_journey_stage_at_time VARCHAR(50),
    user_segment_at_time VARCHAR(50),
    previous_interactions_count INTEGER DEFAULT 0,
    days_since_last_interaction INTEGER,
    
    -- Metadata
    brand VARCHAR(100) DEFAULT 'Sienna Naturals',
    device_type VARCHAR(50),
    location_data JSONB,
    
    -- Success tracking
    goal_achieved BOOLEAN DEFAULT false,
    goal_type VARCHAR(50),
    goal_value DECIMAL(10,2),
    
    FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    FOREIGN KEY (campaign_id) REFERENCES proactive_campaigns(campaign_id) ON DELETE SET NULL,
    CHECK (delivery_status IN ('pending', 'delivered', 'failed', 'bounced', 'spam'))
);

-- ============================================================================
-- A/B TESTING AND EXPERIMENTS
-- ============================================================================

-- A/B testing experiments and results
CREATE TABLE IF NOT EXISTS ab_test_experiments (
    id SERIAL PRIMARY KEY,
    experiment_id VARCHAR(255) UNIQUE DEFAULT gen_random_uuid(),
    
    -- Experiment configuration
    experiment_name VARCHAR(255) NOT NULL,
    experiment_description TEXT,
    experiment_type VARCHAR(50), -- prompt_optimization, personalization, ui_element, etc.
    hypothesis TEXT,
    
    -- Test setup
    control_variant JSONB NOT NULL,
    test_variants JSONB NOT NULL,
    traffic_allocation JSONB, -- {"control": 50, "variant_a": 25, "variant_b": 25}
    
    -- Targeting and sampling
    target_criteria JSONB,
    sample_size_target INTEGER,
    confidence_level DECIMAL(3,2) DEFAULT 0.95,
    statistical_power DECIMAL(3,2) DEFAULT 0.80,
    
    -- Success metrics
    primary_metric VARCHAR(100) NOT NULL,
    secondary_metrics TEXT[],
    success_threshold DECIMAL(5,2),
    
    -- Status and timeline
    status VARCHAR(50) DEFAULT 'draft',
    start_date DATE,
    end_date DATE,
    duration_days INTEGER,
    
    -- Results and analysis
    results_summary JSONB,
    statistical_significance DECIMAL(5,4),
    effect_size DECIMAL(5,4),
    winner_variant VARCHAR(50),
    
    -- Governance
    created_by VARCHAR(255),
    reviewed_by VARCHAR(255),
    approved_by VARCHAR(255),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    brand VARCHAR(100) DEFAULT 'Sienna Naturals',
    
    CHECK (status IN ('draft', 'pending_approval', 'approved', 'running', 'completed', 'cancelled'))
);

-- Individual A/B test results and user assignments
CREATE TABLE IF NOT EXISTS ab_test_results (
    id SERIAL PRIMARY KEY,
    result_id VARCHAR(255) UNIQUE DEFAULT gen_random_uuid(),
    
    -- Test and participant
    experiment_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255),
    session_id VARCHAR(255),
    
    -- Assignment
    variant_assigned VARCHAR(100) NOT NULL,
    assignment_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assignment_method VARCHAR(50) DEFAULT 'random',
    
    -- Outcome measurement
    outcome VARCHAR(100),
    outcome_value DECIMAL(10,2),
    outcome_timestamp TIMESTAMP,
    
    -- Context
    user_segment VARCHAR(50),
    journey_stage VARCHAR(50),
    previous_exposure BOOLEAN DEFAULT false,
    
    -- Conversion tracking
    converted BOOLEAN DEFAULT false,
    conversion_time TIMESTAMP,
    conversion_value DECIMAL(10,2),
    conversion_type VARCHAR(50),
    
    -- Engagement metrics
    session_duration_seconds INTEGER,
    page_views INTEGER,
    interactions_count INTEGER,
    satisfaction_score INTEGER,
    
    -- Metadata
    brand VARCHAR(100) DEFAULT 'Sienna Naturals',
    device_type VARCHAR(50),
    
    FOREIGN KEY (experiment_id) REFERENCES ab_test_experiments(experiment_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE SET NULL
);

-- ============================================================================
-- REAL-TIME MONITORING AND HEALTH
-- ============================================================================

-- Real-time system metrics snapshot
CREATE TABLE IF NOT EXISTS real_time_metrics (
    id SERIAL PRIMARY KEY,
    metric_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- User activity
    active_users INTEGER DEFAULT 0,
    concurrent_conversations INTEGER DEFAULT 0,
    
    -- Conversation volume
    total_conversations INTEGER DEFAULT 0,
    conversations_last_hour INTEGER DEFAULT 0,
    conversations_last_24h INTEGER DEFAULT 0,
    
    -- Performance metrics
    total_messages INTEGER DEFAULT 0,
    average_response_time INTEGER DEFAULT 0,
    median_response_time INTEGER DEFAULT 0,
    p95_response_time INTEGER DEFAULT 0,
    
    -- Quality metrics
    total_errors INTEGER DEFAULT 0,
    error_rate_percent DECIMAL(5,2) DEFAULT 0,
    cache_hit_rate DECIMAL(5,2) DEFAULT 0,
    user_satisfaction_avg DECIMAL(3,2),
    
    -- AI model status
    model_usage JSONB,
    model_health_status JSONB,
    fallback_usage_rate DECIMAL(5,2) DEFAULT 0,
    
    -- System health
    uptime_ms BIGINT DEFAULT 0,
    memory_usage_mb DECIMAL(8,2),
    cpu_usage_percent DECIMAL(5,2),
    disk_usage_percent DECIMAL(5,2),
    
    -- Business metrics
    conversion_events_today INTEGER DEFAULT 0,
    revenue_attributed_today DECIMAL(10,2) DEFAULT 0,
    new_users_today INTEGER DEFAULT 0,
    
    -- Alert thresholds status
    alerts_triggered INTEGER DEFAULT 0,
    critical_issues INTEGER DEFAULT 0,
    
    -- Data quality
    data_freshness_score DECIMAL(3,2) DEFAULT 1.0,
    completeness_score DECIMAL(3,2) DEFAULT 1.0,
    
    -- Metadata
    brand VARCHAR(100) DEFAULT 'Sienna Naturals',
    environment VARCHAR(50) DEFAULT 'production',
    server_id VARCHAR(100),
    data_source VARCHAR(100) DEFAULT 'analytics_tracker'
);

-- System alerts and notifications
CREATE TABLE IF NOT EXISTS system_alerts (
    id SERIAL PRIMARY KEY,
    alert_id VARCHAR(255) UNIQUE DEFAULT gen_random_uuid(),
    
    -- Alert details
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Source and context
    source_component VARCHAR(100),
    source_function VARCHAR(100),
    error_code VARCHAR(50),
    metric_name VARCHAR(100),
    metric_value DECIMAL(10,4),
    threshold_value DECIMAL(10,4),
    
    -- Status and lifecycle
    status VARCHAR(50) DEFAULT 'active',
    acknowledged BOOLEAN DEFAULT false,
    acknowledged_by VARCHAR(255),
    acknowledged_at TIMESTAMP,
    
    -- Resolution
    resolved BOOLEAN DEFAULT false,
    resolved_by VARCHAR(255),
    resolved_at TIMESTAMP,
    resolution_notes TEXT,
    
    -- Impact assessment
    user_impact VARCHAR(20) DEFAULT 'none',
    business_impact VARCHAR(20) DEFAULT 'none',
    affected_users_count INTEGER DEFAULT 0,
    estimated_revenue_impact DECIMAL(10,2),
    
    -- Notification tracking
    notifications_sent INTEGER DEFAULT 0,
    notification_channels JSONB,
    escalation_level INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    environment VARCHAR(50) DEFAULT 'production',
    server_id VARCHAR(100),
    
    CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    CHECK (status IN ('active', 'acknowledged', 'resolved', 'false_positive')),
    CHECK (user_impact IN ('none', 'low', 'medium', 'high')),
    CHECK (business_impact IN ('none', 'low', 'medium', 'high'))
);

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_hair_type ON user_profiles(hair_type);
CREATE INDEX IF NOT EXISTS idx_user_profiles_journey_stage ON user_profiles(journey_stage);
CREATE INDEX IF NOT EXISTS idx_user_profiles_brand ON user_profiles(brand);
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_interaction ON user_profiles(last_interaction);
CREATE INDEX IF NOT EXISTS idx_user_profiles_location ON user_profiles(location_city, location_state);
CREATE INDEX IF NOT EXISTS idx_user_profiles_concerns ON user_profiles USING gin(primary_concerns);

-- Conversations indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_model_used ON conversations(model_used);
CREATE INDEX IF NOT EXISTS idx_conversations_context_type ON conversations(context_type);
CREATE INDEX IF NOT EXISTS idx_conversations_brand ON conversations(brand);
CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_satisfaction ON conversations(user_satisfaction_score) WHERE user_satisfaction_score IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conversations_response_time ON conversations(response_time_ms) WHERE response_time_ms IS NOT NULL;

-- Analytics events indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_brand ON analytics_events(brand);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_category ON analytics_events(event_category);

-- Error logs indexes
CREATE INDEX IF NOT EXISTS idx_error_logs_timestamp ON error_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_error_logs_error_type ON error_logs(error_type);
CREATE INDEX IF NOT EXISTS idx_error_logs_model ON error_logs(model);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity_level);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON error_logs(resolved);

-- Journey stages indexes
CREATE INDEX IF NOT EXISTS idx_user_journey_user_id ON user_journey_stages(user_id);
CREATE INDEX IF NOT EXISTS idx_user_journey_stage ON user_journey_stages(stage);
CREATE INDEX IF NOT EXISTS idx_user_journey_entered_at ON user_journey_stages(stage_entered_at);
CREATE INDEX IF NOT EXISTS idx_user_journey_brand ON user_journey_stages(brand);

-- Brand interactions indexes
CREATE INDEX IF NOT EXISTS idx_brand_interactions_user_id ON brand_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_interactions_brand ON brand_interactions(brand);
CREATE INDEX IF NOT EXISTS idx_brand_interactions_timestamp ON brand_interactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_brand_interactions_type ON brand_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_brand_interactions_conversion ON brand_interactions(conversion_occurred);

-- Product recommendations indexes
CREATE INDEX IF NOT EXISTS idx_product_recommendations_user_id ON product_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_product_recommendations_brand ON product_recommendations(brand);
CREATE INDEX IF NOT EXISTS idx_product_recommendations_timestamp ON product_recommendations(timestamp);
CREATE INDEX IF NOT EXISTS idx_product_recommendations_status ON product_recommendations(recommendation_status);
CREATE INDEX IF NOT EXISTS idx_product_recommendations_converted ON product_recommendations(converted);

-- Store locator indexes
CREATE INDEX IF NOT EXISTS idx_store_locator_user_id ON store_locator_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_store_locator_timestamp ON store_locator_requests(timestamp);
CREATE INDEX IF NOT EXISTS idx_store_locator_location ON store_locator_requests(latitude, longitude);

-- Response cache indexes
CREATE INDEX IF NOT EXISTS idx_response_cache_user_id ON response_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_response_cache_last_accessed ON response_cache(last_accessed);
CREATE INDEX IF NOT EXISTS idx_response_cache_expires_at ON response_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_response_cache_hit_count ON response_cache(hit_count);
CREATE INDEX IF NOT EXISTS idx_response_cache_brand ON response_cache(brand);

-- Engagement patterns indexes
CREATE INDEX IF NOT EXISTS idx_user_engagement_user_id ON user_engagement_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_user_engagement_timestamp ON user_engagement_patterns(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_engagement_type ON user_engagement_patterns(engagement_type);
CREATE INDEX IF NOT EXISTS idx_user_engagement_session ON user_engagement_patterns(session_id);

-- Conversation metrics indexes
CREATE INDEX IF NOT EXISTS idx_conversation_metrics_date ON conversation_metrics(date);
CREATE INDEX IF NOT EXISTS idx_conversation_metrics_brand ON conversation_metrics(brand);
CREATE INDEX IF NOT EXISTS idx_conversation_metrics_time_bucket ON conversation_metrics(time_bucket);

-- Proactive engagement indexes
CREATE INDEX IF NOT EXISTS idx_proactive_engagements_user_id ON proactive_engagements(user_id);
CREATE INDEX IF NOT EXISTS idx_proactive_engagements_campaign_id ON proactive_engagements(campaign_id);
CREATE INDEX IF NOT EXISTS idx_proactive_engagements_trigger_timestamp ON proactive_engagements(trigger_timestamp);
CREATE INDEX IF NOT EXISTS idx_proactive_engagements_delivered_time ON proactive_engagements(delivered_time);

-- A/B testing indexes
CREATE INDEX IF NOT EXISTS idx_ab_test_results_experiment_id ON ab_test_results(experiment_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_results_user_id ON ab_test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_results_variant ON ab_test_results(variant_assigned);
CREATE INDEX IF NOT EXISTS idx_ab_test_results_converted ON ab_test_results(converted);

-- Real-time metrics indexes
CREATE INDEX IF NOT EXISTS idx_real_time_metrics_timestamp ON real_time_metrics(metric_timestamp);
CREATE INDEX IF NOT EXISTS idx_real_time_metrics_brand ON real_time_metrics(brand);

-- System alerts indexes
CREATE INDEX IF NOT EXISTS idx_system_alerts_severity ON system_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_system_alerts_status ON system_alerts(status);
CREATE INDEX IF NOT EXISTS idx_system_alerts_created_at ON system_alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_system_alerts_resolved ON system_alerts(resolved);

-- ============================================================================
-- MATERIALIZED VIEWS FOR ANALYTICS
-- ============================================================================

-- Brand performance comparison view
CREATE MATERIALIZED VIEW IF NOT EXISTS brand_performance_comparison AS
SELECT 
    brand,
    DATE_TRUNC('day', created_at) as date,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(*) as total_conversations,
    AVG(response_time_ms) as avg_response_time,
    AVG(user_satisfaction_score) as avg_satisfaction,
    COUNT(*) FILTER (WHERE was_cached = true) as cached_responses,
    COUNT(*) FILTER (WHERE fallback_used = true) as fallback_responses,
    AVG(confidence_score) as avg_confidence,
    COUNT(DISTINCT session_id) as unique_sessions
FROM conversations 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY brand, DATE_TRUNC('day', created_at)
ORDER BY date DESC, brand;

-- Model performance statistics view
CREATE MATERIALIZED VIEW IF NOT EXISTS model_performance_stats AS
SELECT 
    model_used,
    DATE_TRUNC('hour', created_at) as hour_bucket,
    COUNT(*) as total_requests,
    AVG(response_time_ms) as avg_response_time,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY response_time_ms) as median_response_time,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time_ms) as p95_response_time,
    AVG(confidence_score) as avg_confidence,
    COUNT(*) FILTER (WHERE user_satisfaction_score >= 4) as high_satisfaction_count,
    COUNT(*) FILTER (WHERE user_satisfaction_score <= 2) as low_satisfaction_count,
    COUNT(*) FILTER (WHERE fallback_used = true) as fallback_count
FROM conversations 
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
    AND model_used IS NOT NULL
GROUP BY model_used, DATE_TRUNC('hour', created_at)
ORDER BY hour_bucket DESC, model_used;

-- User journey progression view
CREATE MATERIALIZED VIEW IF NOT EXISTS user_journey_progression AS
SELECT 
    stage,
    brand,
    COUNT(DISTINCT user_id) as users_in_stage,
    AVG(stage_duration_hours) as avg_duration_hours,
    COUNT(*) FILTER (WHERE progression_score > 0) as progressing_users,
    COUNT(*) FILTER (WHERE progression_score < 0) as regressing_users,
    AVG(satisfaction_in_stage) as avg_stage_satisfaction,
    AVG(engagement_level) as avg_engagement_level
FROM user_journey_stages 
WHERE stage_entered_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY stage, brand
ORDER BY 
    CASE stage 
        WHEN 'discovery' THEN 1 
        WHEN 'transition' THEN 2 
        WHEN 'learning' THEN 3 
        WHEN 'experimentation' THEN 4 
        WHEN 'stabilization' THEN 5 
        WHEN 'optimization' THEN 6 
        WHEN 'maintenance' THEN 7 
        WHEN 'mastery' THEN 8 
        ELSE 9 
    END, brand;

-- Cache performance statistics view
CREATE MATERIALIZED VIEW IF NOT EXISTS cache_performance_stats AS
SELECT 
    brand,
    DATE_TRUNC('day', last_accessed) as date,
    COUNT(*) as total_cached_responses,
    SUM(hit_count) as total_hits,
    AVG(hit_count) as avg_hits_per_response,
    COUNT(*) FILTER (WHERE last_accessed >= CURRENT_DATE - INTERVAL '1 day') as active_cache_entries,
    (SUM(hit_count)::DECIMAL / NULLIF(COUNT(*), 0)) * 100 as cache_utilization_rate,
    AVG(relevance_score) as avg_relevance_score,
    AVG(freshness_score) as avg_freshness_score
FROM response_cache 
WHERE last_accessed >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY brand, DATE_TRUNC('day', last_accessed)
ORDER BY date DESC, brand;

-- Circuit breaker status view
CREATE MATERIALIZED VIEW IF NOT EXISTS model_circuit_breaker_status AS
SELECT 
    model_name,
    state,
    CASE 
        WHEN state = 'closed' AND is_healthy = true THEN '🟢 Healthy'
        WHEN state = 'closed' AND is_healthy = false THEN '🟡 Degraded'
        WHEN state = 'half-open' THEN '🟡 Testing'
        WHEN state = 'open' THEN '🔴 Failed'
        ELSE '⚪ Unknown'
    END as status_indicator,
    failure_count,
    success_count,
    (success_count::DECIMAL / NULLIF(total_requests, 0)) * 100 as success_rate,
    average_response_time_ms,
    last_failure_time,
    last_success_time,
    consecutive_failures,
    consecutive_successes,
    is_healthy,
    updated_at
FROM circuit_breaker_states
ORDER BY 
    CASE state 
        WHEN 'open' THEN 1 
        WHEN 'half-open' THEN 2 
        WHEN 'closed' THEN 3 
    END, 
    model_name;

-- User engagement summary view
CREATE MATERIALIZED VIEW IF NOT EXISTS user_engagement_summary AS
SELECT 
    user_id,
    COUNT(DISTINCT DATE_TRUNC('day', timestamp)) as active_days,
    COUNT(*) as total_engagements,
    AVG(duration_seconds) as avg_session_duration,
    AVG(quality_score) as avg_engagement_quality,
    MAX(timestamp) as last_engagement,
    COUNT(DISTINCT engagement_type) as engagement_variety,
    COUNT(*) FILTER (WHERE conversion_attributed = true) as conversion_events,
    ARRAY_AGG(DISTINCT engagement_type ORDER BY engagement_type) as engagement_types
FROM user_engagement_patterns 
WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY user_id;

-- Daily business metrics view
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_business_metrics AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    brand,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(*) as total_conversations,
    AVG(user_satisfaction_score) as avg_satisfaction,
    COUNT(*) FILTER (WHERE context_type = 'shopping') as shopping_conversations,
    COUNT(*) FILTER (WHERE user_satisfaction_score >= 4) as satisfied_users,
    (COUNT(*) FILTER (WHERE user_satisfaction_score >= 4)::DECIMAL / NULLIF(COUNT(*), 0)) * 100 as satisfaction_rate
FROM conversations 
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
    AND user_satisfaction_score IS NOT NULL
GROUP BY DATE_TRUNC('day', created_at), brand
ORDER BY date DESC, brand;

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Update user profile timestamps
CREATE OR REPLACE FUNCTION update_user_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    IF TG_OP = 'INSERT' OR OLD.last_interaction IS NULL THEN
        NEW.last_interaction = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_profile_timestamp
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_user_profile_timestamp();

-- Update circuit breaker states
CREATE OR REPLACE FUNCTION update_circuit_breaker_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_circuit_breaker_timestamp
    BEFORE UPDATE ON circuit_breaker_states
    FOR EACH ROW
    EXECUTE FUNCTION update_circuit_breaker_timestamp();

-- Update cache access times
CREATE OR REPLACE FUNCTION update_cache_access_time()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_accessed = CURRENT_TIMESTAMP;
    NEW.hit_count = COALESCE(OLD.hit_count, 0) + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- DATA RETENTION AND CLEANUP FUNCTIONS
-- ============================================================================

-- Function to clean old analytics events
CREATE OR REPLACE FUNCTION cleanup_old_analytics_events(retention_days INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM analytics_events 
    WHERE timestamp < CURRENT_DATE - INTERVAL '1 day' * retention_days;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    INSERT INTO system_alerts (alert_type, severity, title, message, source_component)
    VALUES ('data_cleanup', 'low', 'Analytics Events Cleanup', 
            'Cleaned up ' || deleted_count || ' old analytics events', 'cleanup_function');
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY brand_performance_comparison;
    REFRESH MATERIALIZED VIEW CONCURRENTLY model_performance_stats;
    REFRESH MATERIALIZED VIEW CONCURRENTLY user_journey_progression;
    REFRESH MATERIALIZED VIEW CONCURRENTLY cache_performance_stats;
    REFRESH MATERIALIZED VIEW CONCURRENTLY model_circuit_breaker_status;
    REFRESH MATERIALIZED VIEW CONCURRENTLY user_engagement_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY daily_business_metrics;
    
    INSERT INTO system_alerts (alert_type, severity, title, message, source_component)
    VALUES ('maintenance', 'low', 'Materialized Views Refreshed', 
            'All analytics materialized views have been refreshed', 'refresh_function');
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INITIAL DATA AND CONFIGURATION
-- ============================================================================

-- Insert default circuit breaker states for known models
INSERT INTO circuit_breaker_states (model_name, state, failure_threshold, reset_timeout_ms) 
VALUES 
    ('gemini20FlashExp', 'closed', 5, 60000),
    ('gemini15Flash', 'closed', 5, 60000),
    ('xaiGrok3Mini', 'closed', 3, 30000),
    ('openai-gpt4', 'closed', 5, 60000)
ON CONFLICT (model_name) DO NOTHING;

-- Insert default proactive campaign templates
INSERT INTO proactive_campaigns (
    campaign_name, campaign_type, campaign_description, target_criteria, 
    trigger_conditions, message_template, success_metrics
) VALUES (
    'Dormant User Re-engagement',
    'reactivation',
    'Re-engage users who haven\'t interacted in over 7 days',
    '{"journey_stage": ["learning", "experimentation"], "days_inactive": {"min": 7, "max": 30}}',
    '{"days_since_last_interaction": 7, "previous_satisfaction": {"min": 3}}',
    'Hi {name}! It''s been a while since we chatted about your {hair_type} hair journey. Ready to pick up where we left off?',
    '{"engagement_rate": 15, "conversation_rate": 5}'
), (
    'Journey Stage Progression',
    'advancement',
    'Help users advance to the next stage of their hair journey',
    '{"stage_duration": {"min": 14}, "satisfaction_score": {"min": 4}}',
    '{"ready_for_next_stage": true, "engagement_level": {"min": 0.7}}',
    'Hi {name}! You''ve been doing great with your {current_stage} routine. Ready to level up your hair care game?',
    '{"progression_rate": 20, "satisfaction_maintenance": 4}'
)
ON CONFLICT (campaign_name) DO NOTHING;

-- Insert sample A/B test experiment
INSERT INTO ab_test_experiments (
    experiment_name, experiment_description, experiment_type, hypothesis,
    control_variant, test_variants, traffic_allocation, primary_metric
) VALUES (
    'Response Length Optimization',
    'Test if shorter responses improve user satisfaction for busy parents',
    'personalization',
    'Shorter, more concise responses will improve satisfaction for time-constrained users',
    '{"response_length": "standard", "persona_optimization": false}',
    '[{"response_length": "short", "persona_optimization": true}, {"response_length": "bullet_points", "persona_optimization": true}]',
    '{"control": 50, "short": 25, "bullet_points": 25}',
    'user_satisfaction_score'
)
ON CONFLICT (experiment_name) DO NOTHING;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Sienna Naturals Enhanced Database Schema Migration Completed Successfully!';
    RAISE NOTICE '';
    RAISE NOTICE 'Created Tables: 20+ core tables';
    RAISE NOTICE 'Created Indexes: 50+ performance indexes';
    RAISE NOTICE 'Created Views: 7 materialized views';
    RAISE NOTICE 'Created Functions: Data cleanup and maintenance functions';
    RAISE NOTICE 'Created Triggers: Automatic timestamp updates';
    RAISE NOTICE '';
    RAISE NOTICE 'Features Enabled:';
    RAISE NOTICE '✅ User profiles with comprehensive hair data';
    RAISE NOTICE '✅ Conversation tracking with AI model analytics';
    RAISE NOTICE '✅ Real-time analytics and engagement metrics';
    RAISE NOTICE '✅ Circuit breaker monitoring for AI models';
    RAISE NOTICE '✅ Intelligent response caching';
    RAISE NOTICE '✅ User journey stage progression tracking';
    RAISE NOTICE '✅ Proactive engagement campaigns';
    RAISE NOTICE '✅ A/B testing framework';
    RAISE NOTICE '✅ Product recommendation tracking';
    RAISE NOTICE '✅ Comprehensive error logging';
    RAISE NOTICE '✅ Personalization effectiveness metrics';
    RAISE NOTICE '✅ Brand performance comparison';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '1. Run: SELECT refresh_analytics_views(); to populate views';
    RAISE NOTICE '2. Configure scheduled jobs for cleanup_old_analytics_events()';
    RAISE NOTICE '3. Set up monitoring alerts for system_alerts table';
    RAISE NOTICE '4. Begin data collection with the enhanced chatbot';
    RAISE NOTICE '';
    RAISE NOTICE 'Database is ready for enterprise-grade chatbot analytics! 🚀';
    RAISE NOTICE '========================================';
END $$;