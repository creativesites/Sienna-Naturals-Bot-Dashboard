// app/api/new-users-by-date/route.js
import { NextResponse } from "next/server";
import { pgClient } from "@/helper/database";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  try {
    const result = await pgClient.query(
      `SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = $1`,
      [date]
    );
    return NextResponse.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch new users" }, { status: 500 });
  }
}