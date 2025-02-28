// app/api/users/route.js
import { NextResponse } from 'next/server';
import { pgClient } from '@/helper/database';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type'); // 'all' or 'latest'

        let query;
        if (type === 'latest') {
            query = `
                SELECT *
                FROM users
                WHERE created_at >= NOW() - INTERVAL '7 days'
                ORDER BY created_at DESC;
            `;
        } else {
            // Default to fetching all users
            query = `
                SELECT *
                FROM users
                ORDER BY created_at DESC;
            `;
        }

        const result = await pgClient.query(query);
        return NextResponse.json(result.rows);

    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}