// app/api/longest-conversation/route.js
import { NextResponse } from "next/server";
import { pgClient } from "@/helper/database";

export async function GET() {
  try {
    const query = `
      SELECT c.user_id, u.name as user_name, jsonb_array_length(c.chat_history) as message_count
      FROM conversations c
      LEFT JOIN users u ON c.user_id = u.user_id
      ORDER BY jsonb_array_length(c.chat_history) DESC
      LIMIT 1
    `;
    const result = await pgClient.query(query);
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching longest conversation:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}