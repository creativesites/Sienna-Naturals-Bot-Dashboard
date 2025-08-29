// app/api/top-chatters/route.js
import { NextResponse } from "next/server";
import { pgClient } from "@/helper/database";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get("timeframe") || "weekly";
    const interval = timeframe === "weekly" ? "7 days" : "30 days";

    const query = `
      SELECT u.user_id, u.name, COUNT(*) as message_count
      FROM messages m
      JOIN users u ON m.user_id = u.user_id
      WHERE m.created_at >= NOW() - INTERVAL '${interval}'
      GROUP BY u.user_id, u.name
      ORDER BY message_count DESC
      LIMIT 5
    `;
    const result = await pgClient.query(query);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching top chatters:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}