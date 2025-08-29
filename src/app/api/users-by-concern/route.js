// app/api/users-by-concern/route.js
import { NextResponse } from "next/server";
import { pgClient } from "@/helper/database";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const concern = searchParams.get("concern");
    const timeframe = searchParams.get("timeframe") || "weekly";
    const interval = timeframe === "weekly" ? "7 days" : "30 days";

    const query = `
      SELECT DISTINCT u.user_id, u.name
      FROM hair_issues hi
      JOIN users u ON hi.user_id = u.user_id
      WHERE hi.issue_description = $1
      AND hi.reported_at >= NOW() - INTERVAL '${interval}'
    `;
    const result = await pgClient.query(query, [concern]);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching users by concern:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}