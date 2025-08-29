// app/api/product-recommendations/route.js
import { NextResponse } from "next/server";
import { pgClient } from "@/helper/database";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get("timeframe") || "weekly";
    const interval = timeframe === "weekly" ? "7 days" : "30 days";

    const query = `
      SELECT product_name, COUNT(*) as count
      FROM recommendations
      WHERE created_at >= NOW() - INTERVAL '${interval}'
      GROUP BY product_name
      ORDER BY count DESC
      LIMIT 5
    `;
    const result = await pgClient.query(query);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching product recommendations:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}