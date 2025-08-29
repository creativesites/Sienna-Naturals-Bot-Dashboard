// app/api/fastest-growing-concern/route.js
import { NextResponse } from "next/server";
import { pgClient } from "@/helper/database";

export async function GET() {
  try {
    const query = `
      SELECT
        issue_description as concern,
COUNT() as current_count,
(SELECT COUNT() FROM hair_issues prev WHERE prev.issue_description = hi.issue_description AND prev.reported_at >= NOW() - INTERVAL '28 days' AND prev.reported_at < NOW() - INTERVAL '14 days') as previous_count
FROM hair_issues hi
WHERE hi.reported_at >= NOW() - INTERVAL '14 days'
GROUP BY issue_description
HAVING (SELECT COUNT() FROM hair_issues prev WHERE prev.issue_description = hi.issue_description AND prev.reported_at >= NOW() - INTERVAL '28 days' AND prev.reported_at < NOW() - INTERVAL '14 days') > 0
ORDER BY (COUNT()::float / (SELECT COUNT(*) FROM hair_issues prev WHERE prev.issue_description = hi.issue_description AND prev.reported_at >= NOW() - INTERVAL '28 days' AND prev.reported_at < NOW() - INTERVAL '14 days')) DESC
LIMIT 1
`;
const result = await pgClient.query(query);
if (result.rows.length === 0) {
return NextResponse.json({ concern: "None", growth: 0 });
}
const { concern, current_count, previous_count } = result.rows[0];
const growth = ((current_count - previous_count) / previous_count * 100).toFixed(2);
return NextResponse.json({ concern, growth });
} catch (error) {
console.error("Error fetching fastest growing concern:", error);
return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
}
}