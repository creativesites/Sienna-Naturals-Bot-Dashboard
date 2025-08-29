import { NextResponse } from 'next/server';
import { pgClient } from '@/helper/database';

export async function POST(request) {
  try {
    const {
      task_id,
      title,
      description,
      tag,
      image_url,
      pdf_url,
      product_id,
      training_data,
      training_status,
      content_type = 'image',
    } = await request.json();

    const query = `
      INSERT INTO training_images (
        task_id, title, description, tag, image_url, pdf_url, product_id, training_data, training_status, content_type
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
    const values = [
      task_id,
      title,
      description,
      tag,
      image_url,
      pdf_url,
      product_id,
      training_data,
      training_status,
      content_type,
    ];

    const result = await pgClient.query(query, values);
    return NextResponse.json({ task: result.rows[0] });
  } catch (error) {
    console.error('Error saving task:', error);
    return NextResponse.json({ error: 'Failed to save task' }, { status: 500 });
  }
}