// app/api/statistics/today/route.js
import { NextResponse } from "next/server";
import { pgClient } from "@/helper/database";

export async function GET() {
  try {
    const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

    // Fetch total messages today
    const totalMessagesQuery = `
      SELECT COUNT(*) as total_messages
      FROM messages
      WHERE DATE(created_at) = $1
    `;
    const totalMessagesResult = await pgClient.query(totalMessagesQuery, [today]);

    // Fetch new users today
    const newUsersQuery = `
      SELECT COUNT(*) as new_users
      FROM users
      WHERE DATE(created_at) = $1
    `;
    const newUsersResult = await pgClient.query(newUsersQuery, [today]);

    // Fetch services recommended today
    const servicesRecommendedQuery = `
      SELECT COUNT(*) as services_recommended
      FROM recommendations
      WHERE DATE(created_at) = $1
    `;
    const servicesRecommendedResult = await pgClient.query(servicesRecommendedQuery, [today]);

    return NextResponse.json({
      totalMessagesToday: totalMessagesResult.rows[0].total_messages,
      newUsersToday: newUsersResult.rows[0].new_users,
      servicesRecommendedToday: servicesRecommendedResult.rows[0].services_recommended,
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}