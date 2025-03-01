// app/api/hair-concerns-overview/route.js
import { NextResponse } from 'next/server';
import { pgClient } from '@/helper/database';

export async function GET(request) {
    try {
        // Get the timeframe from query parameters
        const { searchParams } = new URL(request.url);
        const timeframe = searchParams.get('timeframe') || 'Today'; // Default to 'Today'

        let startDate;
        switch (timeframe) {
            case 'Today':
                startDate = 'NOW() - INTERVAL \'1 day\'';
                break;
            case 'Weekly':
                startDate = 'NOW() - INTERVAL \'7 days\'';
                break;
            case 'Monthly':
                startDate = 'NOW() - INTERVAL \'1 month\'';
                break;
            case 'Yearly':
                startDate = 'NOW() - INTERVAL \'1 year\'';
                break;
            default:
                startDate = 'NOW() - INTERVAL \'1 day\''; // Default to 'Today'
        }

        const query = `
      SELECT
        issue_description as concern,
        COUNT(*) as count
      FROM hair_issues
      WHERE reported_at >= ${startDate}
      GROUP BY issue_description
      ORDER BY count DESC;
    `;

        const result = await pgClient.query(query);

        // If no data, return default values
        if (result.rows.length === 0) {
            return NextResponse.json([
                { concern: 'Dryness', count: 0 },
                { concern: 'Breakage', count: 0 },
                { concern: 'Frizz', count: 0 },
                { concern: 'Dullness', count: 0 },
                { concern: 'Other', count: 0 }
            ]);
        }

        return NextResponse.json(result.rows);

    } catch (error) {
        console.error('Error fetching hair concerns overview:', error);
        return NextResponse.json(
            { error: 'Failed to fetch hair concerns overview' },
            { status: 500 }
        );
    }
}