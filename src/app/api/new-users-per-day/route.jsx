// app/api/new-users-per-day/route.js
import { NextResponse } from 'next/server';
import { pgClient } from '@/helper/database';

export async function GET(request) {
    try {
        // Get new users for the last 7 days.
        const query = `
            SELECT
                DATE(created_at) as date,
                COUNT(*) as new_user_count
            FROM users
            WHERE created_at >= NOW() - INTERVAL '7 days'
            GROUP BY DATE(created_at)
            ORDER BY DATE(created_at) ASC;
        `;

        const result = await pgClient.query(query);

        // Format for ApexCharts: {x: date, y: count}
        const data = result.rows.map(row => ({
            x: row.date,
            y: parseInt(row.new_user_count, 10),
        }));

        // Get today's date
        const today = new Date();
        // Calculate the start date (7 days ago)
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 7); // Corrected to 7 days

        // Create a map to store the new user counts by date
        const newUserCountsMap = new Map();
        data.forEach(item => {
            newUserCountsMap.set(item.x.toISOString().split('T')[0], item.y);
        });

        // Generate the complete array with zeros for missing days
        const completeData = [];
        for (let i = 0; i < 7; i++) { // Corrected to 7 days
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            const dateString = currentDate.toISOString().split('T')[0];
            completeData.push({
                x: currentDate,
                y: newUserCountsMap.get(dateString) || 0,
            });
        }


        return NextResponse.json(completeData);

    } catch (error) {
        console.error('Error fetching new users per day:', error);
        return NextResponse.json(
            { error: 'Failed to fetch new users per day' },
            { status: 500 }
        );
    }
}