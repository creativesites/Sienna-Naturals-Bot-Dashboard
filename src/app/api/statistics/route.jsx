// app/api/statistics/route.js
import { NextResponse } from 'next/server';
import { pgClient } from '@/helper/database'; // Or your DB connection

export async function GET() {
    try {
        // Total Conversations
        const totalConversationsQuery = await pgClient.query('SELECT COUNT(*) FROM conversations');
        const totalConversations = parseInt(totalConversationsQuery.rows[0].count, 10);

        // Active Users (Last 30 Days)
        const activeUsersQuery = await pgClient.query(
            "SELECT COUNT(DISTINCT user_id) FROM conversations WHERE created_at >= NOW() - INTERVAL '30 days'"
        );
        const activeUsers = parseInt(activeUsersQuery.rows[0].count, 10);

        // Total Product Interactions
        const productInteractionsQuery = await pgClient.query('SELECT COUNT(*) FROM product_interactions');
        const productInteractions = parseInt(productInteractionsQuery.rows[0].count, 10);

        // Total Hair Profiles Analyzed
        const hairProfilesQuery = await pgClient.query('SELECT COUNT(*) FROM user_hair_profiles');
        const hairProfiles = parseInt(hairProfilesQuery.rows[0].count, 10);

        // Total Hair Issues
        const totalHairIssuesQuery = await pgClient.query('SELECT COUNT(*) FROM hair_issues'); // Count from hair_issues
        const totalHairIssues = parseInt(totalHairIssuesQuery.rows[0].count, 10);


        // Most Common Hair Concerns (from user_hair_profiles) -- Keep this if you still need it elsewhere
        const commonConcernsQuery = await pgClient.query(`
        SELECT UNNEST(hair_concerns) as concern, COUNT(*) as count
        FROM user_hair_profiles
        WHERE hair_concerns IS NOT NULL
        GROUP BY concern
        ORDER BY count DESC
        LIMIT 5
    `);
        const commonConcerns = commonConcernsQuery.rows;


        // Top Products Clicked (from product_interactions) -- Keep this
        const topProductsQuery = await pgClient.query(
            'SELECT product_name, COUNT(*) as clicks FROM product_interactions GROUP BY product_name ORDER BY clicks DESC LIMIT 5'
        );
        const topProducts = topProductsQuery.rows;

        return NextResponse.json({
            totalConversations,
            activeUsers,
            productInteractions,
            hairProfiles,
            totalHairIssues, // Add totalHairIssues to the response
            commonConcerns, // Keep this if you use it somewhere else
            topProducts,    // Keep this
        });

    } catch (error) {
        console.error('Error fetching bot statistics:', error);
        return NextResponse.json(
            { error: 'Failed to fetch bot statistics' },
            { status: 500 }
        );
    }
}