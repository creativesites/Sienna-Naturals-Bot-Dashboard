// app/api/statistics/route.js
import { NextResponse } from 'next/server';
import { pgClient } from '@/helper/database'; // Assuming pgClient is correctly configured

export async function GET() {
    try {
        // Total Conversations
        const totalConversationsQuery = await pgClient.query('SELECT COUNT(*) FROM conversations');
        const totalConversations = parseInt(totalConversationsQuery.rows[0].count, 10); // Ensure integer

        // Active Users (Last 30 Days)
        const activeUsersQuery = await pgClient.query(
            "SELECT COUNT(DISTINCT user_id) FROM conversations WHERE created_at >= NOW() - INTERVAL '30 days'"
        );
        const activeUsers = parseInt(activeUsersQuery.rows[0].count, 10); // Ensure integer


        // Total Product Interactions
        const productInteractionsQuery = await pgClient.query('SELECT COUNT(*) FROM product_interactions');
        const productInteractions = parseInt(productInteractionsQuery.rows[0].count, 10); // Ensure integer

        // Total Hair Profiles Analyzed (using user_hair_profiles)
        const hairProfilesQuery = await pgClient.query('SELECT COUNT(*) FROM user_hair_profiles');
        const hairProfiles = parseInt(hairProfilesQuery.rows[0].count, 10);

        // Most Common Hair Concerns (from user_hair_profiles)
        const commonConcernsQuery = await pgClient.query(`
        SELECT UNNEST(hair_concerns) as concern, COUNT(*) as count
        FROM user_hair_profiles
        WHERE hair_concerns IS NOT NULL  -- Avoid errors with NULL arrays
        GROUP BY concern
        ORDER BY count DESC
        LIMIT 5
    `);

        const commonConcerns = commonConcernsQuery.rows;

        // Top Products Clicked (from product_interactions)
        const topProductsQuery = await pgClient.query(
            'SELECT product_name, COUNT(*) as clicks FROM product_interactions GROUP BY product_name ORDER BY clicks DESC LIMIT 5'
        );
        const topProducts = topProductsQuery.rows;


        return NextResponse.json({
            totalConversations,
            activeUsers,
            productInteractions,
            hairProfiles,
            commonConcerns,
            topProducts,
        });
    } catch (error) {
        console.error('Error fetching bot statistics:', error);
        return NextResponse.json(
            { error: 'Failed to fetch bot statistics' },
            { status: 500 }
        );
    }
}