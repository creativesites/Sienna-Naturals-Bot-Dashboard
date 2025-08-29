// app/api/hair-profiles/[profileId]/route.js
import { NextResponse } from 'next/server';
import { pgClient } from '@/helper/database';

export async function GET(request, { params }) {
    try {
        const { profileId } = await params;

        // Comprehensive query to get detailed hair profile information
        const profileQuery = `
            SELECT 
                u.user_id,
                u.name,
                u.email,
                u.created_at,
                u.updated_at,
                u.hair_type,
                u.hair_texture,
                u.hair_color,
                u.scalp_condition,
                u.hair_length,
                u.hair_porosity,
                u.hair_density,
                u.styling_preference,
                u.chemical_treatments,
                u.hair_goals,
                
                -- Profile completeness score
                (
                    CASE WHEN u.hair_type IS NOT NULL THEN 1 ELSE 0 END +
                    CASE WHEN u.hair_texture IS NOT NULL THEN 1 ELSE 0 END +
                    CASE WHEN u.hair_color IS NOT NULL THEN 1 ELSE 0 END +
                    CASE WHEN u.scalp_condition IS NOT NULL THEN 1 ELSE 0 END +
                    CASE WHEN u.hair_length IS NOT NULL THEN 1 ELSE 0 END +
                    CASE WHEN u.hair_porosity IS NOT NULL THEN 1 ELSE 0 END +
                    CASE WHEN u.hair_density IS NOT NULL THEN 1 ELSE 0 END +
                    CASE WHEN u.styling_preference IS NOT NULL THEN 1 ELSE 0 END
                ) * 12.5 as profile_completeness_score
                
            FROM users u
            WHERE u.user_id = $1
        `;

        // Get hair issues history
        const issuesQuery = `
            SELECT 
                hi.issue_id,
                hi.issue_description,
                hi.severity_level,
                hi.reported_at,
                hi.resolution_status,
                hi.notes
            FROM hair_issues hi
            WHERE hi.user_id = $1
            ORDER BY hi.reported_at DESC
        `;

        // Get conversation history
        const conversationsQuery = `
            SELECT 
                c.conversation_id,
                c.created_at,
                c.summary,
                CASE 
                    WHEN c.chat_history IS NOT NULL THEN 
                        jsonb_array_length(c.chat_history::jsonb)
                    ELSE 0 
                END as message_count
            FROM conversations c
            WHERE c.user_id = $1
            ORDER BY c.created_at DESC
            LIMIT 10
        `;

        // Get product recommendations
        const recommendationsQuery = `
            SELECT 
                pr.recommendation_id,
                pr.product_name,
                pr.product_category,
                pr.recommended_at,
                pr.recommendation_reason,
                pr.effectiveness_rating
            FROM product_recommendations pr
            WHERE pr.user_id = $1
            ORDER BY pr.recommended_at DESC
        `;

        // Get hair journey timeline (issues, treatments, improvements)
        const timelineQuery = `
            SELECT 
                'issue' as event_type,
                hi.issue_description as event_title,
                hi.severity_level as event_detail,
                hi.reported_at as event_date,
                hi.notes as event_notes
            FROM hair_issues hi
            WHERE hi.user_id = $1
            
            UNION ALL
            
            SELECT 
                'recommendation' as event_type,
                pr.product_name as event_title,
                pr.product_category as event_detail,
                pr.recommended_at as event_date,
                pr.recommendation_reason as event_notes
            FROM product_recommendations pr
            WHERE pr.user_id = $1
            
            ORDER BY event_date DESC
            LIMIT 20
        `;

        // Execute all queries in parallel
        const [
            profileResult,
            issuesResult,
            conversationsResult,
            recommendationsResult,
            timelineResult
        ] = await Promise.all([
            pgClient.query(profileQuery, [profileId]),
            pgClient.query(issuesQuery, [profileId]),
            pgClient.query(conversationsQuery, [profileId]),
            pgClient.query(recommendationsQuery, [profileId]),
            pgClient.query(timelineQuery, [profileId])
        ]);

        if (profileResult.rows.length === 0) {
            return NextResponse.json(
                { error: 'Hair profile not found' },
                { status: 404 }
            );
        }

        const profile = profileResult.rows[0];
        const issues = issuesResult.rows;
        const conversations = conversationsResult.rows;
        const recommendations = recommendationsResult.rows;
        const timeline = timelineResult.rows;

        // Calculate hair health metrics
        const activeIssues = issues.filter(issue => 
            issue.resolution_status !== 'resolved' && 
            issue.resolution_status !== 'improved'
        );

        const recentIssues = issues.filter(issue => {
            const issueDate = new Date(issue.reported_at);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return issueDate >= thirtyDaysAgo;
        });

        const hairHealthScore = issues.length === 0 ? 100 : 
            issues.length <= 2 ? 85 :
            issues.length <= 5 ? 70 : 50;

        // Categorize issues
        const issueCategories = {};
        issues.forEach(issue => {
            const category = issue.issue_description?.toLowerCase().includes('dryness') ? 'Dryness' :
                           issue.issue_description?.toLowerCase().includes('damage') ? 'Damage' :
                           issue.issue_description?.toLowerCase().includes('loss') || issue.issue_description?.toLowerCase().includes('thinning') ? 'Hair Loss' :
                           issue.issue_description?.toLowerCase().includes('scalp') ? 'Scalp Issues' :
                           issue.issue_description?.toLowerCase().includes('color') || issue.issue_description?.toLowerCase().includes('fading') ? 'Color Issues' :
                           'Other';
            
            issueCategories[category] = (issueCategories[category] || 0) + 1;
        });

        return NextResponse.json({
            profile: {
                ...profile,
                hair_health_score: hairHealthScore,
                active_issues_count: activeIssues.length,
                recent_issues_count: recentIssues.length,
                total_conversations: conversations.length,
                total_recommendations: recommendations.length
            },
            issues,
            conversations,
            recommendations,
            timeline,
            analytics: {
                issue_categories: issueCategories,
                hair_health_trend: {
                    current_score: hairHealthScore,
                    // This would ideally be calculated from historical data
                    trend: recentIssues.length > activeIssues.length ? 'improving' : 
                           recentIssues.length < activeIssues.length ? 'declining' : 'stable'
                },
                engagement_metrics: {
                    total_conversations: conversations.length,
                    avg_messages_per_conversation: conversations.reduce((sum, conv) => sum + conv.message_count, 0) / (conversations.length || 1),
                    last_activity: conversations.length > 0 ? conversations[0].created_at : null
                }
            }
        });

    } catch (error) {
        console.error('Error fetching hair profile:', error);
        return NextResponse.json(
            { error: 'Failed to fetch hair profile', details: error.message },
            { status: 500 }
        );
    }
}