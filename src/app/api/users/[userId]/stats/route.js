// app/api/users/[userId]/stats/route.ts
import { NextResponse } from 'next/server';
import { pgClient } from '@/helper/database';

export async function GET(request, { params }) {
    try {
        const userId = params.userId;

        // Total Conversations
        const totalConversationsQuery = await pgClient.query(
            'SELECT COUNT(*) FROM conversations WHERE user_id = $1',
            [userId]
        );
        const totalConversations = parseInt(totalConversationsQuery.rows[0].count, 10);

        // Total Messages (assuming you want to count individual messages within conversations)
        const totalMessagesQuery = await pgClient.query(
            `SELECT jsonb_array_length(chat_history) as message_count
             FROM conversations
             WHERE user_id = $1`,
            [userId]
        );
        // Sum the message counts from all conversations. Handle potential nulls.
        const totalMessages = totalMessagesQuery.rows.reduce(
            (sum, row) => sum + (row.message_count || 0),  // Use 0 if message_count is null
            0
        );
        // Total Hair Issues
        const totalHairIssuesQuery = await pgClient.query(
            'SELECT COUNT(*) FROM hair_issues WHERE user_id = $1',
            [userId]
        );
        const totalHairIssues = parseInt(totalHairIssuesQuery.rows[0].count, 10);


        return NextResponse.json({
            totalConversations,
            totalMessages,
            totalHairIssues,
        });

    } catch (error) {
        console.error('Error fetching user statistics:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user statistics' },
            { status: 500 }
        );
    }
}