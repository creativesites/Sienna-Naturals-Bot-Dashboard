// app/api/conversation-concerns/route.js
import { NextResponse } from "next/server";
import { pgClient } from "@/helper/database";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const conversation_id = searchParams.get("conversation_id");

    const query = `
      SELECT hi.issue_description as concern
      FROM hair_issues hi
      JOIN conversations c ON hi.user_id = c.user_id
      WHERE c.conversation_id = $1
    `;
    const result = await pgClient.query(query, [conversation_id]);
    const concerns = result.rows.map(row => row.concern);
    return NextResponse.json({ concerns });
  } catch (error) {
    console.error("Error fetching conversation concerns:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}