import { NextResponse } from "next/server";
import { pgClient } from "@/helper/database";

// GET - Fetch all testimonials
export async function GET() {
    try {
        const result = await pgClient.query("SELECT * FROM testimonials");
        return NextResponse.json({ testimonials: result.rows });
    } catch (error) {
        console.error("Error fetching testimonials:", error);
        return NextResponse.json({ error: "Failed to fetch testimonials", details: error.message }, { status: 500 });
    }
}

// POST - Add a new testimonial
export async function POST(request) {
    const { name, testimonial } = await request.json();

    try {
        const query = `
            INSERT INTO testimonials (name, testimonial)
            VALUES ($1, $2)
            RETURNING *;
        `;
        const values = [name, testimonial];
        const result = await pgClient.query(query, values);

        return NextResponse.json({ message: "Testimonial added successfully", testimonial: result.rows[0] });
    } catch (error) {
        console.error("Error adding testimonial:", error);
        return NextResponse.json({ error: "Failed to add testimonial", details: error.message }, { status: 500 });
    }
}

// PUT - Update a testimonial
export async function PUT(request, { params }) {
    const { testimonial_id } = params;
    const { name, testimonial } = await request.json();

    try {
        const query = `
            UPDATE testimonials
            SET name = $1, testimonial = $2
            WHERE testimonial_id = $3
            RETURNING *;
        `;
        const values = [name, testimonial, testimonial_id];
        const result = await pgClient.query(query, values);

        if (result.rows.length === 0) {
            return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Testimonial updated successfully", testimonial: result.rows[0] });
    } catch (error) {
        console.error("Error updating testimonial:", error);
        return NextResponse.json({ error: "Failed to update testimonial", details: error.message }, { status: 500 });
    }
}

// DELETE - Delete a testimonial
export async function DELETE(request, { params }) {
    const { testimonial_id } = params;

    try {
        const query = `
            DELETE FROM testimonials
            WHERE testimonial_id = $1
            RETURNING *;
        `;
        const result = await pgClient.query(query, [testimonial_id]);

        if (result.rows.length === 0) {
            return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Testimonial deleted successfully" });
    } catch (error) {
        console.error("Error deleting testimonial:", error);
        return NextResponse.json({ error: "Failed to delete testimonial", details: error.message }, { status: 500 });
    }
}