// app/api/conversations/route.ts
import { NextResponse } from 'next/server';
import { pgClient } from '@/helper/database';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        let query = `
            SELECT conversation_id, user_id, created_at, summary
            FROM conversations
        `;

        const queryParams = [];

        if(search){
            query+= ` WHERE user_id ILIKE $1 OR summary ILIKE $1`;
            queryParams.push(`%${search}%`);
        }

        query += ` ORDER BY created_at DESC`;
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