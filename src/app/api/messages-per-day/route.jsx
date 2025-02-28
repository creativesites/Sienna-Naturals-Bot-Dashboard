// app/api/messages-per-day/route.js
import { NextResponse } from 'next/server';
import { pgClient } from '@/helper/database';

export async function GET(request) {
    try {
        // Get the last 30 days of data.  Adjust the interval as needed.
        const query = `
      SELECT
        DATE(created_at) as date,
        COUNT(*) as message_count
      FROM conversations
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC;
    `;

        const result = await pgClient.query(query);

        // Format the data for ApexCharts.  ApexCharts expects an array of {x: date, y: count} objects.
        const data = result.rows.map(row => ({
            x: row.date, // row.date is already a Date object thanks to PostgreSQL
            y: parseInt(row.message_count, 10), // Ensure count is an integer
        }));
        // Get today's date
        const today = new Date();
        // Calculate the start date (30 days ago)
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 30);

        // Create a map to store the message counts by date
        const messageCountsMap = new Map();
        data.forEach(item => {
            messageCountsMap.set(item.x.toISOString().split('T')[0], item.y);
        });

        // Generate the complete array with zeros for missing days
        const completeData = [];
        for (let i = 0; i < 30; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            const dateString = currentDate.toISOString().split('T')[0];
            completeData.push({
                x: currentDate,
                y: messageCountsMap.get(dateString) || 0,
            });
        }
        return NextResponse.json(completeData);

    } catch (error) {
        console.error('Error fetching messages per day:', error);
        return NextResponse.json(
            { error: 'Failed to fetch messages per day' },
            { status: 500 }
        );
    }
}