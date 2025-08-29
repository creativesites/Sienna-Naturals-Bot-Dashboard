// app/api/messages-by-date/route.js
import { NextResponse } from "next/server";
import { pgClient } from "@/helper/database";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    const query = `
      SELECT COUNT(*) as count
      FROM messages
      WHERE DATE(created_at) = $1
    `;
    const result = await pgClient.query(query, [date]);
    return NextResponse.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error("Error fetching messages by date:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}