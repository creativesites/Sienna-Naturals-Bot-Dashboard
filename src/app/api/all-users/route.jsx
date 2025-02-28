// app/api/all-users/route.jsx
import { NextResponse } from 'next/server';
import { pgClient } from '@/helper/database';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '10', 10);
        const offset = (page - 1) * limit;

        const queryParams = [];
        let query = `SELECT * FROM users`;
        let countQuery = `SELECT COUNT(*) as total FROM users`; // Count query

        if (search) {
            query += ` WHERE name ILIKE $1 OR email ILIKE $1`;
            countQuery += ` WHERE name ILIKE $1 OR email ILIKE $1`; // Add WHERE to countQuery
            queryParams.push(`%${search}%`);
        }

        query += ` ORDER BY created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
        queryParams.push(limit, offset);


        const [usersResult, countResult] = await Promise.all([
            pgClient.query(query, queryParams),
            pgClient.query(countQuery, search ? queryParams.slice(0, 1) : []), // Pass search param if needed
        ]);


        return NextResponse.json({
            users: usersResult.rows,
            total: parseInt(countResult.rows[0].total, 10), // Return total count
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}