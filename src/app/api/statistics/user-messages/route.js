// app/api/statistics/user-messages/route.js
import { NextResponse } from "next/server";
import { pgClient } from "@/helper/database";

export async function GET() {
  try {
    const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

    const query = `
      SELECT user_id, COUNT(*) as message_count
      FROM messages
      WHERE DATE(created_at) = $1
      GROUP BY user_id
    `;
    const result = await pgClient.query(query, [today]);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching user message data:", error);
    return NextResponse.json(
      { error: "Failed to fetch user message data" },
      { status: 500 }
    );
  }
}