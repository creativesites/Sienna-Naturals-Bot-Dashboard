import { NextResponse } from 'next/server';
import { pgClient } from '@/helper/database';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const conversation_id = searchParams.get('conversation_id');

  try {
    const query = `
      SELECT 
        id,
        conversation_id,
        message_index,
        correction_note,
        created_at
      FROM corrections
      ${conversation_id ? 'WHERE conversation_id = $1' : ''}
      ORDER BY created_at DESC
    `;
    const values = conversation_id ? [conversation_id] : [];
    const result = await pgClient.query(query, values);

    return NextResponse.json({ corrections: result.rows });
  } catch (error) {
    console.error("Error fetching corrections:", error);
    return NextResponse.json({ error: 'Failed to fetch corrections' }, { status: 500 });
  }
}

export async function POST(request) {
  const correctionData = await request.json();

  try {
    const { conversation_id, message_index, correction_note } = correctionData;

    const query = `
      INSERT INTO corrections (conversation_id, message_index, correction_note)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;

    const values = [conversation_id, message_index, correction_note];

    const result = await pgClient.query(query, values);
    return NextResponse.json({ message: "Correction created successfully", correction: result.rows[0] });
  } catch (error) {
    console.error("Error creating correction:", error);
    return NextResponse.json({ error: "Failed to create correction", details: error.message }, { status: 500 });
  }
}