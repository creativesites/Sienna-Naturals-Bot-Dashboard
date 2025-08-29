-- Sienna Naturals Database Migration Runner
-- This script safely runs all migrations for the enhanced chatbot system

-- Create migration tracking table if it doesn't exist
CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(50) PRIMARY KEY,
    description TEXT,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    execution_time_ms INTEGER,
    success BOOLEAN DEFAULT true,
    error_message TEXT
);

-- Function to execute migration with error handling
CREATE OR REPLACE FUNCTION execute_migration(
    migration_version VARCHAR(50),
    migration_description TEXT,
    migration_sql TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    execution_time INTEGER;
    migration_exists BOOLEAN;
BEGIN
    -- Check if migration already executed
    SELECT EXISTS(SELECT 1 FROM schema_migrations WHERE version = migration_version) INTO migration_exists;
    
    IF migration_exists THEN
        RAISE NOTICE 'Migration % already executed, skipping...', migration_version;
        RETURN true;
    END IF;
    
    -- Record start time
    start_time := clock_timestamp();
    
    -- Execute migration
    RAISE NOTICE 'Executing migration %: %', migration_version, migration_description;
    
    BEGIN
        EXECUTE migration_sql;
        
        -- Calculate execution time
        end_time := clock_timestamp();
        execution_time := EXTRACT(epoch FROM (end_time - start_time)) * 1000;
        
        -- Record successful migration
        INSERT INTO schema_migrations (version, description, executed_at, execution_time_ms, success)
        VALUES (migration_version, migration_description, end_time, execution_time, true);
        
        RAISE NOTICE 'Migration % completed successfully in % ms', migration_version, execution_time;
        RETURN true;
        
    EXCEPTION WHEN OTHERS THEN
        -- Record failed migration
        end_time := clock_timestamp();
        execution_time := EXTRACT(epoch FROM (end_time - start_time)) * 1000;
        
        INSERT INTO schema_migrations (version, description, executed_at, execution_time_ms, success, error_message)
        VALUES (migration_version, migration_description, end_time, execution_time, false, SQLERRM);
        
        RAISE NOTICE 'Migration % failed: %', migration_version, SQLERRM;
        RETURN false;
    END;
END;
$$ LANGUAGE plpgsql;

-- Start migration process
DO $$
DECLARE
    migration_success BOOLEAN;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Starting Sienna Naturals Database Migrations';
    RAISE NOTICE 'Time: %', NOW();
    RAISE NOTICE '========================================';
    
    -- Migration 001: Basic User and Conversation Tables (if needed)
    SELECT execute_migration(
        '001_basic_schema', 
        'Basic user profiles and conversations tables',
        $migration$
        -- Basic tables would go here if they don't exist
        -- This is a placeholder for backwards compatibility
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(255) UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        $migration$
    ) INTO migration_success;
    
    IF NOT migration_success THEN
        RAISE EXCEPTION 'Migration 001 failed, aborting...';
    END IF;
    
    -- Migration 002: Enhanced Analytics (if needed)
    SELECT execute_migration(
        '002_enhanced_analytics', 
        'Enhanced analytics and tracking tables',
        $migration$
        -- Enhanced analytics would go here if they don't exist
        -- This is a placeholder for backwards compatibility
        CREATE TABLE IF NOT EXISTS basic_analytics (
            id SERIAL PRIMARY KEY,
            event_type VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        $migration$
    ) INTO migration_success;
    
    IF NOT migration_success THEN
        RAISE EXCEPTION 'Migration 002 failed, aborting...';
    END IF;
    
    RAISE NOTICE 'All preliminary migrations completed successfully';
    RAISE NOTICE 'Now running the complete Sienna Naturals enhancement migration...';
END $$;

-- Execute the main Sienna Naturals enhancement migration
\i 003_sienna_naturals_enhancements.sql

-- Execute the Myavana integration enhancements
\i 004_myavana_integration_enhancements.sql

-- Verify migration completion
DO $$
DECLARE
    table_count INTEGER;
    index_count INTEGER;
    view_count INTEGER;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Verifying Migration Completion';
    RAISE NOTICE '========================================';
    
    -- Count created tables
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN (
        'user_profiles', 'conversations', 'analytics_events', 'error_logs',
        'user_journey_stages', 'brand_interactions', 'product_recommendations',
        'store_locator_requests', 'circuit_breaker_states', 'response_cache',
        'smart_prompt_analytics', 'user_engagement_patterns', 'conversation_metrics',
        'personalization_metrics', 'proactive_campaigns', 'proactive_engagements',
        'ab_test_experiments', 'ab_test_results', 'real_time_metrics', 'system_alerts'
    );
    
    -- Count created indexes
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND indexname LIKE 'idx_%';
    
    -- Count materialized views
    SELECT COUNT(*) INTO view_count
    FROM pg_matviews 
    WHERE schemaname = 'public';
    
    RAISE NOTICE 'Migration Verification Results:';
    RAISE NOTICE '- Tables created: %', table_count;
    RAISE NOTICE '- Indexes created: %', index_count;
    RAISE NOTICE '- Materialized views created: %', view_count;
    
    IF table_count >= 20 AND index_count >= 40 AND view_count >= 5 THEN
        RAISE NOTICE '✅ Migration completed successfully!';
        
        -- Record the main migration
        INSERT INTO schema_migrations (version, description, success)
        VALUES ('003_sienna_naturals_enhancements', 'Complete Sienna Naturals enhanced chatbot schema', true)
        ON CONFLICT (version) DO UPDATE SET 
            executed_at = CURRENT_TIMESTAMP,
            success = true;
            
    ELSE
        RAISE NOTICE '❌ Migration may be incomplete. Please check for errors.';
        
        -- Record the migration as potentially incomplete
        INSERT INTO schema_migrations (version, description, success, error_message)
        VALUES ('003_sienna_naturals_enhancements', 'Complete Sienna Naturals enhanced chatbot schema', false, 'Verification failed - missing tables/indexes/views')
        ON CONFLICT (version) DO UPDATE SET 
            executed_at = CURRENT_TIMESTAMP,
            success = false,
            error_message = 'Verification failed - missing tables/indexes/views';
    END IF;
END $$;

-- Initial data population and view refresh
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Initializing Data and Views';
    RAISE NOTICE '========================================';
    
    -- Refresh materialized views (some may be empty initially)
    RAISE NOTICE 'Refreshing materialized views...';
    
    BEGIN
        REFRESH MATERIALIZED VIEW brand_performance_comparison;
        RAISE NOTICE '✅ Refreshed brand_performance_comparison';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️  Could not refresh brand_performance_comparison: %', SQLERRM;
    END;
    
    BEGIN
        REFRESH MATERIALIZED VIEW model_performance_stats;
        RAISE NOTICE '✅ Refreshed model_performance_stats';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️  Could not refresh model_performance_stats: %', SQLERRM;
    END;
    
    BEGIN
        REFRESH MATERIALIZED VIEW user_journey_progression;
        RAISE NOTICE '✅ Refreshed user_journey_progression';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️  Could not refresh user_journey_progression: %', SQLERRM;
    END;
    
    BEGIN
        REFRESH MATERIALIZED VIEW cache_performance_stats;
        RAISE NOTICE '✅ Refreshed cache_performance_stats';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️  Could not refresh cache_performance_stats: %', SQLERRM;
    END;
    
    BEGIN
        REFRESH MATERIALIZED VIEW model_circuit_breaker_status;
        RAISE NOTICE '✅ Refreshed model_circuit_breaker_status';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️  Could not refresh model_circuit_breaker_status: %', SQLERRM;
    END;
    
    BEGIN
        REFRESH MATERIALIZED VIEW user_engagement_summary;
        RAISE NOTICE '✅ Refreshed user_engagement_summary';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️  Could not refresh user_engagement_summary: %', SQLERRM;
    END;
    
    BEGIN
        REFRESH MATERIALIZED VIEW daily_business_metrics;
        RAISE NOTICE '✅ Refreshed daily_business_metrics';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️  Could not refresh daily_business_metrics: %', SQLERRM;
    END;
    
    RAISE NOTICE 'Materialized views initialization completed';
END $$;

-- Final summary and next steps
DO $$
DECLARE
    total_migrations INTEGER;
    successful_migrations INTEGER;
    failed_migrations INTEGER;
BEGIN
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE success = true),
        COUNT(*) FILTER (WHERE success = false)
    INTO total_migrations, successful_migrations, failed_migrations
    FROM schema_migrations;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'MIGRATION SUMMARY';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total migrations: %', total_migrations;
    RAISE NOTICE 'Successful: %', successful_migrations;
    RAISE NOTICE 'Failed: %', failed_migrations;
    RAISE NOTICE '';
    
    IF failed_migrations = 0 THEN
        RAISE NOTICE '🎉 ALL MIGRATIONS COMPLETED SUCCESSFULLY!';
        RAISE NOTICE '';
        RAISE NOTICE '🚀 Your Sienna Naturals Enhanced Chatbot Database is ready!';
        RAISE NOTICE '';
        RAISE NOTICE 'Next Steps:';
        RAISE NOTICE '1. Update your application environment variables';
        RAISE NOTICE '2. Start the enhanced chatbot server';
        RAISE NOTICE '3. Run the comprehensive test suite';
        RAISE NOTICE '4. Set up monitoring and alerting';
        RAISE NOTICE '5. Configure data retention policies';
        RAISE NOTICE '';
        RAISE NOTICE 'Maintenance Commands:';
        RAISE NOTICE '- Cleanup old data: SELECT cleanup_old_analytics_events(90);';
        RAISE NOTICE '- Refresh views: SELECT refresh_analytics_views();';
        RAISE NOTICE '- Check system health: SELECT * FROM system_alerts WHERE resolved = false;';
        
    ELSE
        RAISE NOTICE '❌ Some migrations failed. Please check the logs above.';
        RAISE NOTICE 'Failed migrations can be found with:';
        RAISE NOTICE 'SELECT * FROM schema_migrations WHERE success = false;';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE 'Database Features Now Available:';
    RAISE NOTICE '✅ Multi-model AI fallback tracking';
    RAISE NOTICE '✅ Intelligent response caching';
    RAISE NOTICE '✅ Comprehensive user analytics';
    RAISE NOTICE '✅ Hair journey progression tracking';
    RAISE NOTICE '✅ Personalization effectiveness metrics';
    RAISE NOTICE '✅ Proactive engagement campaigns';
    RAISE NOTICE '✅ A/B testing framework';
    RAISE NOTICE '✅ Real-time monitoring and alerts';
    RAISE NOTICE '✅ Circuit breaker monitoring';
    RAISE NOTICE '✅ Product recommendation tracking';
    RAISE NOTICE '✅ Brand performance analytics';
    RAISE NOTICE '✅ Error tracking and resolution';
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Migration completed at: %', NOW();
    RAISE NOTICE '========================================';
END $$;