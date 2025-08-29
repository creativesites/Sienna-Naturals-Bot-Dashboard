-- Sienna Naturals Database Enhancement Migration (Version 4.0.0)
-- Description: Integration enhancements from Myavana Chatbot Dashboard
-- Date: 2025-08-28
-- Author: Claude Code Integration Agent

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin" COMMENT 'For better performance on complex GIN indexes';

-- ============================================================================
-- ENHANCED CONVERSATION INTELLIGENCE TABLES
-- ============================================================================

-- Conversation intelligence metrics for advanced analytics
CREATE TABLE IF NOT EXISTS conversation_intelligence (
    id SERIAL PRIMARY KEY,
    conversation_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    
    -- Sentiment Analysis
    sentiment VARCHAR(20) DEFAULT 'neutral', -- positive, negative, neutral, mixed
    sentiment_score DECIMAL(4,3), -- -1.0 to 1.0
    sentiment_confidence DECIMAL(3,2), -- 0.0 to 1.0
    emotion_detected VARCHAR(50), -- joy, sadness, anger, fear, surprise, etc.
    emotion_intensity DECIMAL(3,2), -- 0.0 to 1.0
    
    -- Topic Analysis
    primary_topics TEXT[], -- Array of detected topics
    topic_confidence JSONB, -- {"hair_care": 0.85, "products": 0.72, ...}
    intent_category VARCHAR(100), -- question, complaint, compliment, product_inquiry
    intent_confidence DECIMAL(3,2),
    
    -- Conversation Quality Metrics
    coherence_score DECIMAL(3,2), -- How well the conversation flows
    relevance_score DECIMAL(3,2), -- How relevant AI responses are
    satisfaction_predicted DECIMAL(3,2), -- AI-predicted user satisfaction
    resolution_likelihood DECIMAL(3,2), -- Likelihood user's issue was resolved
    
    -- Language Analysis
    complexity_level VARCHAR(20) DEFAULT 'medium', -- simple, medium, complex
    reading_level INTEGER, -- Grade level (1-12+)
    formality_score DECIMAL(3,2), -- 0.0 (informal) to 1.0 (formal)
    politeness_score DECIMAL(3,2), -- 0.0 (rude) to 1.0 (polite)
    
    -- Engagement Metrics
    conversation_depth INTEGER DEFAULT 1, -- Number of back-and-forth exchanges
    user_engagement_score DECIMAL(3,2), -- Calculated engagement level
    ai_helpfulness_score DECIMAL(3,2), -- How helpful was the AI response
    follow_up_needed BOOLEAN DEFAULT false,
    
    -- Resolution Tracking
    issue_resolved BOOLEAN,
    resolution_method VARCHAR(100), -- ai_response, human_handoff, self_service
    satisfaction_feedback INTEGER, -- 1-5 user rating if provided
    feedback_text TEXT, -- User's written feedback
    
    -- Context and Environment
    conversation_context JSONB, -- Rich context data
    user_journey_stage_at_time VARCHAR(50),
    previous_conversation_count INTEGER DEFAULT 0,
    session_duration_seconds INTEGER,
    
    -- AI Model Performance
    model_used VARCHAR(100),
    response_time_ms INTEGER,
    tokens_used INTEGER,
    confidence_score DECIMAL(3,2),
    fallback_used BOOLEAN DEFAULT false,
    
    -- Metadata
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    analysis_version VARCHAR(20) DEFAULT '1.0',
    brand VARCHAR(100) DEFAULT 'Sienna Naturals',
    
    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    
    -- Constraints
    CHECK (sentiment_score >= -1.0 AND sentiment_score <= 1.0),
    CHECK (sentiment_confidence >= 0.0 AND sentiment_confidence <= 1.0),
    CHECK (emotion_intensity >= 0.0 AND emotion_intensity <= 1.0),
    CHECK (satisfaction_feedback IS NULL OR (satisfaction_feedback >= 1 AND satisfaction_feedback <= 5))
);

-- Real-time conversation concerns tracking
CREATE TABLE IF NOT EXISTS conversation_concerns (
    id SERIAL PRIMARY KEY,
    concern_id VARCHAR(255) UNIQUE DEFAULT gen_random_uuid(),
    
    -- Concern Details
    concern_type VARCHAR(100) NOT NULL, -- hair_damage, product_reaction, styling_issue, etc.
    concern_category VARCHAR(50), -- technical, product, service, general
    severity_level VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
    
    -- User Context
    user_id VARCHAR(255),
    conversation_id VARCHAR(255),
    message_id INTEGER, -- Link to specific message that raised concern
    
    -- Concern Content
    concern_description TEXT NOT NULL,
    concern_keywords TEXT[], -- Keywords that flagged this concern
    user_reported BOOLEAN DEFAULT false, -- Did user explicitly report this?
    ai_detected BOOLEAN DEFAULT false, -- Was this auto-detected by AI?
    
    -- Classification
    hair_concern_type VARCHAR(100), -- breakage, dryness, scalp_irritation, color_damage
    product_related BOOLEAN DEFAULT false,
    product_names TEXT[], -- If product-related, which products
    urgency_score DECIMAL(3,2) DEFAULT 0.5, -- 0.0 to 1.0
    
    -- Resolution Tracking
    status VARCHAR(50) DEFAULT 'open', -- open, in_progress, resolved, escalated, closed
    assigned_to VARCHAR(255), -- Staff member or system handling this
    resolution_notes TEXT,
    resolution_date TIMESTAMP,
    resolution_method VARCHAR(100), -- self_service, ai_guidance, human_expert, product_replacement
    
    -- Impact Assessment
    user_satisfaction_impact INTEGER, -- -2 to +2 scale
    business_impact_level VARCHAR(20) DEFAULT 'low', -- low, medium, high
    similar_concerns_count INTEGER DEFAULT 1, -- How many similar concerns exist
    
    -- Follow-up
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date TIMESTAMP,
    follow_up_completed BOOLEAN DEFAULT false,
    follow_up_notes TEXT,
    
    -- Analytics
    first_detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tags TEXT[], -- Custom tags for grouping/filtering
    brand VARCHAR(100) DEFAULT 'Sienna Naturals',
    
    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE SET NULL,
    
    -- Constraints
    CHECK (severity_level IN ('low', 'medium', 'high', 'critical')),
    CHECK (status IN ('open', 'in_progress', 'resolved', 'escalated', 'closed')),
    CHECK (urgency_score >= 0.0 AND urgency_score <= 1.0),
    CHECK (user_satisfaction_impact >= -2 AND user_satisfaction_impact <= 2)
);

-- ============================================================================
-- ENHANCED PRODUCT AND INVENTORY TABLES
-- ============================================================================

-- Enhanced products table with comprehensive attributes
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(255) UNIQUE NOT NULL,
    
    -- Basic Product Information
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) DEFAULT 'Sienna Naturals',
    category VARCHAR(100) NOT NULL, -- shampoo, conditioner, treatment, styling, etc.
    subcategory VARCHAR(100), -- sulfate_free_shampoo, leave_in_conditioner, etc.
    product_line VARCHAR(100), -- signature_line, premium_line, travel_size
    
    -- Product Details
    description TEXT,
    short_description VARCHAR(500),
    key_benefits TEXT[],
    target_hair_types TEXT[], -- 3a, 3b, 3c, 4a, 4b, 4c, all_types
    target_concerns TEXT[], -- dryness, breakage, frizz, lack_of_shine, etc.
    suitable_for_journey_stages TEXT[], -- discovery, transition, maintenance, etc.
    
    -- Ingredients and Formulation
    key_ingredients TEXT[],
    all_ingredients TEXT,
    ingredient_highlights TEXT[], -- natural, organic, sulfate_free, paraben_free
    allergens TEXT[],
    ph_level DECIMAL(3,1), -- pH value if relevant
    
    -- Usage Instructions
    usage_instructions TEXT,
    frequency_recommendation VARCHAR(100), -- daily, weekly, as_needed
    application_method TEXT,
    precautions TEXT[],
    
    -- Pricing and Availability
    price DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT 'USD',
    size VARCHAR(50), -- 8oz, 16oz, 32oz, travel_size
    unit_type VARCHAR(20), -- fl_oz, ml, count, etc.
    
    -- Inventory and Status
    sku VARCHAR(100),
    upc VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active', -- active, discontinued, seasonal, pre_order
    availability VARCHAR(50) DEFAULT 'in_stock', -- in_stock, out_of_stock, low_stock, pre_order
    stock_quantity INTEGER DEFAULT 0,
    reorder_level INTEGER DEFAULT 10,
    
    -- Digital Assets
    primary_image_url TEXT,
    additional_image_urls TEXT[],
    video_url TEXT,
    instruction_video_url TEXT,
    
    -- SEO and Marketing
    seo_title VARCHAR(255),
    seo_description TEXT,
    meta_keywords TEXT[],
    marketing_tags TEXT[],
    
    -- Reviews and Ratings
    average_rating DECIMAL(3,2) DEFAULT 0.0, -- 0.0 to 5.0
    review_count INTEGER DEFAULT 0,
    recommendation_score DECIMAL(3,2) DEFAULT 0.0, -- 0.0 to 1.0
    
    -- AI and Recommendations
    ai_recommendation_tags TEXT[], -- frequently_recommended, bestseller, new_arrival
    personalization_factors JSONB, -- Factors that make this product suitable
    seasonal_relevance JSONB, -- {"winter": 0.8, "summer": 0.6, "spring": 0.7, "fall": 0.9}
    
    -- Launch and Lifecycle
    launch_date DATE,
    discontinuation_date DATE,
    is_featured BOOLEAN DEFAULT false,
    is_bestseller BOOLEAN DEFAULT false,
    is_new_arrival BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    last_modified_by VARCHAR(255),
    
    -- Constraints
    CHECK (average_rating >= 0.0 AND average_rating <= 5.0),
    CHECK (recommendation_score >= 0.0 AND recommendation_score <= 1.0),
    CHECK (review_count >= 0),
    CHECK (stock_quantity >= 0)
);

-- Product performance analytics
CREATE TABLE IF NOT EXISTS product_performance (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(255) NOT NULL,
    
    -- Time Period
    date DATE NOT NULL,
    period_type VARCHAR(20) DEFAULT 'daily', -- daily, weekly, monthly
    
    -- Recommendation Metrics
    times_recommended INTEGER DEFAULT 0,
    times_clicked INTEGER DEFAULT 0,
    times_purchased INTEGER DEFAULT 0,
    click_through_rate DECIMAL(5,2) DEFAULT 0.0,
    conversion_rate DECIMAL(5,2) DEFAULT 0.0,
    
    -- User Interaction
    unique_users_recommended INTEGER DEFAULT 0,
    unique_users_clicked INTEGER DEFAULT 0,
    unique_users_purchased INTEGER DEFAULT 0,
    average_user_rating DECIMAL(3,2),
    user_feedback_count INTEGER DEFAULT 0,
    
    -- AI Model Performance
    recommendation_accuracy DECIMAL(3,2), -- How accurate were our recommendations
    user_satisfaction_with_product DECIMAL(3,2), -- User satisfaction specific to this product
    return_rate DECIMAL(5,2) DEFAULT 0.0,
    repeat_purchase_rate DECIMAL(5,2) DEFAULT 0.0,
    
    -- Context Analysis
    recommended_for_hair_types JSONB, -- {"3c": 45, "4a": 30, "4b": 25}
    recommended_for_concerns JSONB, -- {"dryness": 60, "breakage": 40}
    recommended_in_journey_stages JSONB, -- {"transition": 50, "maintenance": 30}
    
    -- Seasonal and Trend Data
    seasonal_performance JSONB,
    trending_score DECIMAL(3,2) DEFAULT 0.0,
    competitor_comparison JSONB,
    
    -- Financial Metrics
    revenue_generated DECIMAL(10,2) DEFAULT 0.0,
    profit_margin DECIMAL(5,2),
    inventory_turnover_rate DECIMAL(5,2),
    
    -- Metadata
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    brand VARCHAR(100) DEFAULT 'Sienna Naturals',
    
    -- Foreign Keys
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    
    -- Unique constraint for time-series data
    UNIQUE(product_id, date, period_type)
);

-- ============================================================================
-- TEAM MANAGEMENT AND USER ROLES
-- ============================================================================

-- Team members and roles management
CREATE TABLE IF NOT EXISTS team_members (
    id SERIAL PRIMARY KEY,
    member_id VARCHAR(255) UNIQUE NOT NULL,
    
    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    profile_image_url TEXT,
    
    -- Role and Permissions
    role VARCHAR(50) NOT NULL, -- admin, manager, analyst, support, viewer
    department VARCHAR(100), -- analytics, support, marketing, product
    title VARCHAR(150),
    permissions JSONB, -- Detailed permissions object
    
    -- Access Control
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP,
    login_count INTEGER DEFAULT 0,
    failed_login_attempts INTEGER DEFAULT 0,
    
    -- Dashboard Preferences
    dashboard_preferences JSONB,
    notification_preferences JSONB,
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'en',
    
    -- Activity Tracking
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    last_active_at TIMESTAMP,
    
    -- Audit Trail
    password_last_changed TIMESTAMP,
    profile_last_updated TIMESTAMP,
    
    -- Constraints
    CHECK (role IN ('admin', 'manager', 'analyst', 'support', 'viewer')),
    CHECK (failed_login_attempts >= 0)
);

-- Team activity logs
CREATE TABLE IF NOT EXISTS team_activity_logs (
    id SERIAL PRIMARY KEY,
    log_id VARCHAR(255) UNIQUE DEFAULT gen_random_uuid(),
    
    -- Actor and Action
    member_id VARCHAR(255),
    action_type VARCHAR(100) NOT NULL, -- login, logout, view_dashboard, export_data, etc.
    action_category VARCHAR(50), -- authentication, data_access, system_change
    action_description TEXT,
    
    -- Target and Context
    target_resource VARCHAR(255), -- dashboard, user_profile, product, etc.
    target_id VARCHAR(255), -- ID of the target resource
    old_values JSONB, -- Previous values if applicable
    new_values JSONB, -- New values if applicable
    
    -- Request Information
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    request_id VARCHAR(255),
    
    -- Results
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    duration_ms INTEGER,
    
    -- Metadata
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    brand VARCHAR(100) DEFAULT 'Sienna Naturals',
    
    -- Foreign Keys
    FOREIGN KEY (member_id) REFERENCES team_members(member_id) ON DELETE SET NULL
);

-- ============================================================================
-- COPILOTKIT INTEGRATION TABLES
-- ============================================================================

-- CopilotKit actions and responses
CREATE TABLE IF NOT EXISTS copilot_actions (
    id SERIAL PRIMARY KEY,
    action_id VARCHAR(255) UNIQUE DEFAULT gen_random_uuid(),
    
    -- Action Details
    action_name VARCHAR(100) NOT NULL,
    action_type VARCHAR(50) NOT NULL, -- chat, analysis, generation, search
    action_description TEXT,
    
    -- User Context
    user_id VARCHAR(255),
    session_id VARCHAR(255),
    conversation_id VARCHAR(255),
    
    -- Input and Parameters
    input_prompt TEXT NOT NULL,
    action_parameters JSONB,
    context_data JSONB,
    
    -- AI Processing
    model_used VARCHAR(100),
    processing_time_ms INTEGER,
    tokens_consumed INTEGER,
    
    -- Output
    action_result JSONB,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    confidence_score DECIMAL(3,2),
    
    -- User Interaction
    user_feedback VARCHAR(50), -- helpful, not_helpful, partially_helpful
    user_rating INTEGER, -- 1-5 scale
    user_comments TEXT,
    
    -- Metadata
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    brand VARCHAR(100) DEFAULT 'Sienna Naturals',
    
    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE SET NULL,
    
    -- Constraints
    CHECK (user_rating IS NULL OR (user_rating >= 1 AND user_rating <= 5)),
    CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0)
);

-- ============================================================================
-- FILE UPLOAD AND PROCESSING TABLES
-- ============================================================================

-- File uploads and processing tracking
CREATE TABLE IF NOT EXISTS file_uploads (
    id SERIAL PRIMARY KEY,
    upload_id VARCHAR(255) UNIQUE DEFAULT gen_random_uuid(),
    
    -- File Details
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- image, pdf, document, audio, video
    mime_type VARCHAR(100),
    file_size_bytes INTEGER,
    file_extension VARCHAR(20),
    
    -- Upload Context
    user_id VARCHAR(255),
    session_id VARCHAR(255),
    conversation_id VARCHAR(255),
    upload_purpose VARCHAR(100), -- hair_analysis, product_image, instruction_manual
    
    -- Storage Information
    storage_provider VARCHAR(50) DEFAULT 'local', -- local, s3, cloudinary, bytescale
    storage_path TEXT NOT NULL,
    storage_url TEXT,
    thumbnail_url TEXT,
    
    -- Processing Status
    processing_status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
    processing_started_at TIMESTAMP,
    processing_completed_at TIMESTAMP,
    processing_duration_ms INTEGER,
    
    -- Analysis Results (if applicable)
    analysis_results JSONB, -- Hair analysis, image recognition, etc.
    extracted_text TEXT, -- For PDF/document processing
    metadata JSONB, -- Image EXIF, document properties, etc.
    
    -- Security and Validation
    is_validated BOOLEAN DEFAULT false,
    validation_errors TEXT[],
    content_warnings TEXT[], -- inappropriate_content, low_quality, etc.
    virus_scan_status VARCHAR(20) DEFAULT 'pending', -- pending, clean, infected, error
    
    -- Privacy and Retention
    is_public BOOLEAN DEFAULT false,
    retention_policy VARCHAR(50) DEFAULT 'standard', -- standard, extended, permanent
    expires_at TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Metadata
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP,
    access_count INTEGER DEFAULT 0,
    brand VARCHAR(100) DEFAULT 'Sienna Naturals',
    
    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE SET NULL,
    
    -- Constraints
    CHECK (file_size_bytes > 0),
    CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    CHECK (virus_scan_status IN ('pending', 'clean', 'infected', 'error'))
);

-- ============================================================================
-- PERFORMANCE INDEXES FOR NEW TABLES
-- ============================================================================

-- Conversation Intelligence Indexes
CREATE INDEX IF NOT EXISTS idx_conversation_intelligence_conversation_id ON conversation_intelligence(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_intelligence_user_id ON conversation_intelligence(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_intelligence_sentiment ON conversation_intelligence(sentiment);
CREATE INDEX IF NOT EXISTS idx_conversation_intelligence_analyzed_at ON conversation_intelligence(analyzed_at);
CREATE INDEX IF NOT EXISTS idx_conversation_intelligence_brand ON conversation_intelligence(brand);
CREATE INDEX IF NOT EXISTS idx_conversation_intelligence_topics ON conversation_intelligence USING gin(primary_topics);
CREATE INDEX IF NOT EXISTS idx_conversation_intelligence_satisfaction ON conversation_intelligence(satisfaction_predicted) WHERE satisfaction_predicted IS NOT NULL;

-- Conversation Concerns Indexes
CREATE INDEX IF NOT EXISTS idx_conversation_concerns_user_id ON conversation_concerns(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_concerns_type ON conversation_concerns(concern_type);
CREATE INDEX IF NOT EXISTS idx_conversation_concerns_status ON conversation_concerns(status);
CREATE INDEX IF NOT EXISTS idx_conversation_concerns_severity ON conversation_concerns(severity_level);
CREATE INDEX IF NOT EXISTS idx_conversation_concerns_detected_at ON conversation_concerns(first_detected_at);
CREATE INDEX IF NOT EXISTS idx_conversation_concerns_keywords ON conversation_concerns USING gin(concern_keywords);
CREATE INDEX IF NOT EXISTS idx_conversation_concerns_hair_type ON conversation_concerns(hair_concern_type);

-- Products Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_availability ON products(availability);
CREATE INDEX IF NOT EXISTS idx_products_target_hair_types ON products USING gin(target_hair_types);
CREATE INDEX IF NOT EXISTS idx_products_target_concerns ON products USING gin(target_concerns);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(average_rating);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- Product Performance Indexes
CREATE INDEX IF NOT EXISTS idx_product_performance_product_id ON product_performance(product_id);
CREATE INDEX IF NOT EXISTS idx_product_performance_date ON product_performance(date);
CREATE INDEX IF NOT EXISTS idx_product_performance_period_type ON product_performance(period_type);
CREATE INDEX IF NOT EXISTS idx_product_performance_conversion_rate ON product_performance(conversion_rate);
CREATE INDEX IF NOT EXISTS idx_product_performance_revenue ON product_performance(revenue_generated);

-- Team Members Indexes
CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_members_role ON team_members(role);
CREATE INDEX IF NOT EXISTS idx_team_members_department ON team_members(department);
CREATE INDEX IF NOT EXISTS idx_team_members_is_active ON team_members(is_active);
CREATE INDEX IF NOT EXISTS idx_team_members_last_login ON team_members(last_login);

-- Team Activity Logs Indexes
CREATE INDEX IF NOT EXISTS idx_team_activity_logs_member_id ON team_activity_logs(member_id);
CREATE INDEX IF NOT EXISTS idx_team_activity_logs_action_type ON team_activity_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_team_activity_logs_timestamp ON team_activity_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_team_activity_logs_success ON team_activity_logs(success);

-- CopilotKit Actions Indexes
CREATE INDEX IF NOT EXISTS idx_copilot_actions_user_id ON copilot_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_copilot_actions_session_id ON copilot_actions(session_id);
CREATE INDEX IF NOT EXISTS idx_copilot_actions_action_type ON copilot_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_copilot_actions_executed_at ON copilot_actions(executed_at);
CREATE INDEX IF NOT EXISTS idx_copilot_actions_success ON copilot_actions(success);

-- File Uploads Indexes
CREATE INDEX IF NOT EXISTS idx_file_uploads_user_id ON file_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_file_type ON file_uploads(file_type);
CREATE INDEX IF NOT EXISTS idx_file_uploads_processing_status ON file_uploads(processing_status);
CREATE INDEX IF NOT EXISTS idx_file_uploads_uploaded_at ON file_uploads(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_file_uploads_expires_at ON file_uploads(expires_at) WHERE expires_at IS NOT NULL;

-- ============================================================================
-- MATERIALIZED VIEWS FOR ENHANCED ANALYTICS
-- ============================================================================

-- Conversation Intelligence Summary
CREATE MATERIALIZED VIEW IF NOT EXISTS conversation_intelligence_summary AS
SELECT 
    DATE_TRUNC('day', analyzed_at) as date,
    brand,
    COUNT(*) as total_conversations,
    AVG(sentiment_score) as avg_sentiment_score,
    COUNT(*) FILTER (WHERE sentiment = 'positive') as positive_conversations,
    COUNT(*) FILTER (WHERE sentiment = 'negative') as negative_conversations,
    COUNT(*) FILTER (WHERE sentiment = 'neutral') as neutral_conversations,
    AVG(coherence_score) as avg_coherence,
    AVG(relevance_score) as avg_relevance,
    AVG(satisfaction_predicted) as avg_predicted_satisfaction,
    COUNT(*) FILTER (WHERE issue_resolved = true) as resolved_issues,
    (COUNT(*) FILTER (WHERE issue_resolved = true)::DECIMAL / NULLIF(COUNT(*), 0)) * 100 as resolution_rate,
    AVG(conversation_depth) as avg_conversation_depth,
    COUNT(DISTINCT user_id) as unique_users
FROM conversation_intelligence
WHERE analyzed_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', analyzed_at), brand
ORDER BY date DESC, brand;

-- Product Recommendation Performance
CREATE MATERIALIZED VIEW IF NOT EXISTS product_recommendation_performance AS
SELECT 
    p.product_id,
    p.name as product_name,
    p.category,
    p.brand,
    COUNT(pr.id) as total_recommendations,
    COUNT(*) FILTER (WHERE pr.clicked = true) as total_clicks,
    COUNT(*) FILTER (WHERE pr.converted = true) as total_conversions,
    (COUNT(*) FILTER (WHERE pr.clicked = true)::DECIMAL / NULLIF(COUNT(pr.id), 0)) * 100 as click_through_rate,
    (COUNT(*) FILTER (WHERE pr.converted = true)::DECIMAL / NULLIF(COUNT(pr.id), 0)) * 100 as conversion_rate,
    AVG(pr.recommendation_confidence) as avg_confidence,
    SUM(pr.conversion_value) as total_revenue,
    AVG(pr.conversion_value) FILTER (WHERE pr.converted = true) as avg_conversion_value
FROM products p
LEFT JOIN product_recommendations pr ON p.product_id = pr.product_id
WHERE pr.timestamp >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY p.product_id, p.name, p.category, p.brand
ORDER BY total_recommendations DESC;

-- Team Performance Summary
CREATE MATERIALIZED VIEW IF NOT EXISTS team_performance_summary AS
SELECT 
    tm.member_id,
    tm.first_name || ' ' || tm.last_name as full_name,
    tm.role,
    tm.department,
    tm.last_login,
    COUNT(tal.id) as total_actions,
    COUNT(tal.id) FILTER (WHERE tal.action_category = 'data_access') as data_access_actions,
    COUNT(tal.id) FILTER (WHERE tal.action_category = 'system_change') as system_changes,
    COUNT(tal.id) FILTER (WHERE tal.success = false) as failed_actions,
    (COUNT(tal.id) FILTER (WHERE tal.success = true)::DECIMAL / NULLIF(COUNT(tal.id), 0)) * 100 as success_rate,
    AVG(tal.duration_ms) as avg_action_duration
FROM team_members tm
LEFT JOIN team_activity_logs tal ON tm.member_id = tal.member_id
WHERE tal.timestamp >= CURRENT_DATE - INTERVAL '30 days'
    AND tm.is_active = true
GROUP BY tm.member_id, tm.first_name, tm.last_name, tm.role, tm.department, tm.last_login
ORDER BY total_actions DESC;

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Update product updated_at timestamp
CREATE OR REPLACE FUNCTION update_products_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_products_timestamp
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_products_timestamp();

-- Update team member timestamps
CREATE OR REPLACE FUNCTION update_team_members_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    IF TG_OP = 'UPDATE' AND OLD.first_name != NEW.first_name OR OLD.last_name != NEW.last_name OR OLD.email != NEW.email THEN
        NEW.profile_last_updated = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_team_members_timestamp
    BEFORE UPDATE ON team_members
    FOR EACH ROW
    EXECUTE FUNCTION update_team_members_timestamp();

-- Update conversation concerns timestamp
CREATE OR REPLACE FUNCTION update_conversation_concerns_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_conversation_concerns_timestamp
    BEFORE UPDATE ON conversation_concerns
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_concerns_timestamp();

-- ============================================================================
-- DATA CLEANUP AND MAINTENANCE FUNCTIONS
-- ============================================================================

-- Function to cleanup old file uploads
CREATE OR REPLACE FUNCTION cleanup_expired_file_uploads()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete expired files
    DELETE FROM file_uploads 
    WHERE expires_at IS NOT NULL 
    AND expires_at < CURRENT_TIMESTAMP
    AND deleted_at IS NULL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log cleanup activity
    INSERT INTO system_alerts (alert_type, severity, title, message, source_component)
    VALUES ('maintenance', 'low', 'File Uploads Cleanup', 
            'Cleaned up ' || deleted_count || ' expired file uploads', 'cleanup_function');
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update product performance metrics
CREATE OR REPLACE FUNCTION update_product_performance_daily()
RETURNS VOID AS $$
DECLARE
    target_date DATE := CURRENT_DATE - INTERVAL '1 day';
BEGIN
    -- Calculate daily product performance metrics
    INSERT INTO product_performance (
        product_id, date, period_type,
        times_recommended, times_clicked, times_purchased,
        unique_users_recommended, unique_users_clicked, unique_users_purchased,
        click_through_rate, conversion_rate, revenue_generated
    )
    SELECT 
        pr.product_id,
        target_date,
        'daily',
        COUNT(*) as times_recommended,
        COUNT(*) FILTER (WHERE pr.clicked = true) as times_clicked,
        COUNT(*) FILTER (WHERE pr.converted = true) as times_purchased,
        COUNT(DISTINCT pr.user_id) as unique_users_recommended,
        COUNT(DISTINCT pr.user_id) FILTER (WHERE pr.clicked = true) as unique_users_clicked,
        COUNT(DISTINCT pr.user_id) FILTER (WHERE pr.converted = true) as unique_users_purchased,
        (COUNT(*) FILTER (WHERE pr.clicked = true)::DECIMAL / NULLIF(COUNT(*), 0)) * 100 as click_through_rate,
        (COUNT(*) FILTER (WHERE pr.converted = true)::DECIMAL / NULLIF(COUNT(*), 0)) * 100 as conversion_rate,
        SUM(pr.conversion_value) as revenue_generated
    FROM product_recommendations pr
    WHERE DATE(pr.timestamp) = target_date
    GROUP BY pr.product_id
    ON CONFLICT (product_id, date, period_type) 
    DO UPDATE SET
        times_recommended = EXCLUDED.times_recommended,
        times_clicked = EXCLUDED.times_clicked,
        times_purchased = EXCLUDED.times_purchased,
        unique_users_recommended = EXCLUDED.unique_users_recommended,
        unique_users_clicked = EXCLUDED.unique_users_clicked,
        unique_users_purchased = EXCLUDED.unique_users_purchased,
        click_through_rate = EXCLUDED.click_through_rate,
        conversion_rate = EXCLUDED.conversion_rate,
        revenue_generated = EXCLUDED.revenue_generated,
        calculated_at = CURRENT_TIMESTAMP;
    
    -- Log performance calculation
    INSERT INTO system_alerts (alert_type, severity, title, message, source_component)
    VALUES ('maintenance', 'low', 'Product Performance Updated', 
            'Daily product performance metrics calculated for ' || target_date, 'performance_calculator');
END;
$$ LANGUAGE plpgsql;

-- Function to refresh enhanced materialized views
CREATE OR REPLACE FUNCTION refresh_enhanced_analytics_views()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY conversation_intelligence_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY product_recommendation_performance;
    REFRESH MATERIALIZED VIEW CONCURRENTLY team_performance_summary;
    
    INSERT INTO system_alerts (alert_type, severity, title, message, source_component)
    VALUES ('maintenance', 'low', 'Enhanced Analytics Views Refreshed', 
            'All enhanced analytics materialized views have been refreshed', 'view_refresh_function');
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INITIAL DATA POPULATION
-- ============================================================================

-- Insert sample products for testing
INSERT INTO products (
    product_id, name, category, subcategory, description, 
    target_hair_types, target_concerns, key_ingredients, price, size, status
) VALUES 
(
    'SN001',
    'Moisture Rich Shampoo',
    'shampoo',
    'moisturizing_shampoo',
    'Gentle, sulfate-free shampoo designed to cleanse while maintaining natural moisture',
    ARRAY['3a', '3b', '3c', '4a', '4b', '4c'],
    ARRAY['dryness', 'frizz', 'breakage'],
    ARRAY['shea_butter', 'coconut_oil', 'argan_oil'],
    24.99,
    '12oz',
    'active'
),
(
    'SN002',
    'Deep Repair Conditioner',
    'conditioner',
    'deep_conditioner',
    'Intensive conditioning treatment for damaged and chemically processed hair',
    ARRAY['3b', '3c', '4a', '4b', '4c'],
    ARRAY['damage', 'breakage', 'color_treatment'],
    ARRAY['keratin', 'protein_complex', 'olive_oil'],
    28.99,
    '8oz',
    'active'
),
(
    'SN003',
    'Curl Defining Cream',
    'styling',
    'curl_cream',
    'Lightweight cream that defines curls while reducing frizz and adding shine',
    ARRAY['3a', '3b', '3c'],
    ARRAY['frizz', 'curl_definition', 'shine'],
    ARRAY['flaxseed_gel', 'aloe_vera', 'jojoba_oil'],
    19.99,
    '6oz',
    'active'
)
ON CONFLICT (product_id) DO NOTHING;

-- Insert sample team members
INSERT INTO team_members (
    member_id, first_name, last_name, email, role, department, 
    permissions, is_active, dashboard_preferences
) VALUES 
(
    'TM001',
    'Admin',
    'User',
    'admin@sienna-naturals.com',
    'admin',
    'management',
    '{"dashboard": {"read": true, "write": true}, "analytics": {"read": true, "export": true}, "users": {"read": true, "write": true}, "products": {"read": true, "write": true}}',
    true,
    '{"default_view": "overview", "refresh_interval": 30000, "show_notifications": true}'
),
(
    'TM002',
    'Analytics',
    'Manager',
    'analytics@sienna-naturals.com',
    'analyst',
    'analytics',
    '{"dashboard": {"read": true}, "analytics": {"read": true, "export": true}, "users": {"read": true}, "products": {"read": true}}',
    true,
    '{"default_view": "analytics", "refresh_interval": 60000, "show_notifications": true}'
)
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Sienna Naturals Myavana Integration Enhancement Completed Successfully!';
    RAISE NOTICE '';
    RAISE NOTICE 'New Features Added:';
    RAISE NOTICE '✅ Conversation Intelligence Analysis';
    RAISE NOTICE '✅ Enhanced Product Management';
    RAISE NOTICE '✅ Team Management System';
    RAISE NOTICE '✅ CopilotKit Integration Support';
    RAISE NOTICE '✅ File Upload and Processing Tracking';
    RAISE NOTICE '✅ Advanced Concern Detection and Resolution';
    RAISE NOTICE '✅ Product Performance Analytics';
    RAISE NOTICE '✅ Team Activity Monitoring';
    RAISE NOTICE '';
    RAISE NOTICE 'Database Tables Added: 8 new tables';
    RAISE NOTICE 'Performance Indexes: 20+ new indexes';
    RAISE NOTICE 'Materialized Views: 3 new analytics views';
    RAISE NOTICE 'Functions: Enhanced cleanup and maintenance';
    RAISE NOTICE 'Triggers: Automatic timestamp updates';
    RAISE NOTICE '';
    RAISE NOTICE 'Ready for Integration! 🚀';
    RAISE NOTICE '========================================';
END $$;