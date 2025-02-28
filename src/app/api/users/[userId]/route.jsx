// app/api/users/[userId]/route.ts
import { NextResponse } from 'next/server';
import { pgClient } from '@/helper/database';

export async function GET(request, { params }) {
    try {
        const userId = params.userId;

        const query = `
      SELECT *
      FROM users
      WHERE user_id = $1;
    `;

        const result = await pgClient.query(query, [userId]);

        if (result.rows.length === 0) {
            return NextResponse.json(null, { status: 404 }); // Return 404 if user not found
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching user details:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user details' },
            { status: 500 }
        );
    }
}