import { NextResponse } from "next/server";
import { pgClient } from "@/helper/database";

// GET - Fetch bot instructions with instruction_id = 1
export async function GET() {
    try {
        const query = `
            SELECT * FROM bot_instructions
            WHERE instruction_id = 1;
        `;
        const result = await pgClient.query(query);

        if (result.rows.length === 0) {
            return NextResponse.json({ error: "Bot instructions not found" }, { status: 404 });
        }

        return NextResponse.json({ instruction: result.rows[0] });
    } catch (error) {
        console.error("Error fetching bot instructions:", error);
        return NextResponse.json({ error: "Failed to fetch bot instructions", details: error.message }, { status: 500 });
    }
}

// PUT - Update bot instructions
export async function PUT(request) {
    const { instruction_id, instruction_text, category } = await request.json();

    try {
        const query = `
            UPDATE bot_instructions
            SET instruction_text = $1, category = $2
            WHERE instruction_id = $3
            RETURNING *;
        `;

        const values = [instruction_text, category, instruction_id];
        const result = await pgClient.query(query, values);

        if (result.rows.length === 0) {
            return NextResponse.json({ error: "Bot instructions not found for update" }, { status: 404 });
        }

        return NextResponse.json({ message: "Bot instructions updated successfully", instruction: result.rows[0] });
    } catch (error) {
        console.error("Error updating bot instructions:", error);
        return NextResponse.json({ error: "Failed to update bot instructions", details: error.message }, { status: 500 });
    }
}