// app/api/average-conversation-length/route.js
import { NextResponse } from "next/server";
import { pgClient } from "@/helper/database";

export async function GET() {
  try {
    const query = `
      SELECT AVG(jsonb_array_length(chat_history)) as avg_length
      FROM conversations
    `;
    const result = await pgClient.query(query);
    return NextResponse.json({ avg_length: parseFloat(result.rows[0].avg_length) });
  } catch (error) {
    console.error("Error fetching average conversation length:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}