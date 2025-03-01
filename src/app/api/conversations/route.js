// app/api/conversations/route.ts
import { NextResponse } from 'next/server';
import { pgClient } from '@/helper/database'; // Or your DB connection

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        let query = `
      SELECT c.conversation_id, c.user_id, c.created_at, c.summary, c.chat_history, u.name as user_name
      FROM conversations c
      LEFT JOIN users u ON c.user_id = u.user_id  -- Join with the users table
    `;

        const queryParams = [];

        if (search) {
            query += ` WHERE c.user_id ILIKE $1 OR c.summary ILIKE $1`; // Search on user_id and summary
            queryParams.push(`%${search}%`);
        }

        query += ` ORDER BY c.created_at DESC`; // Order by creation date
        const result = await pgClient.query(query, queryParams);
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        return NextResponse.json(
            { error: 'Failed to fetch conversations' },
            { status: 500 }
        );
    }
}