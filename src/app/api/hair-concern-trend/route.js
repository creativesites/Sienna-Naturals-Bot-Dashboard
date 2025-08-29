// app/api/hair-concern-trend/route.js
import { NextResponse } from "next/server";
import { pgClient } from "@/helper/database";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const concern = searchParams.get("concern");
    const timeframe = searchParams.get("timeframe") || "monthly";
    const interval = timeframe === "monthly" ? "30 days" : "1 year";
    const halfInterval = timeframe === "monthly" ? "15 days" : "6 months";

    const query = `
      SELECT
        (SELECT COUNT(*) FROM hair_issues WHERE issue_description = $1 AND reported_at >= NOW() - INTERVAL '${interval}') as current,
        (SELECT COUNT(*) FROM hair_issues WHERE issue_description = $1 AND reported_at >= NOW() - INTERVAL '${interval}' AND reported_at < NOW() - INTERVAL '${halfInterval}') as previous
    `;
    const result = await pgClient.query(query, [concern]);
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching concern trend:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}