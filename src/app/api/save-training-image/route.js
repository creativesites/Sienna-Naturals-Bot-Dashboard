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
      product_id, 
      training_data 
    } = await request.json();
    
    if (!task_id || !title || !image_url) {
      return NextResponse.json(
        { error: "Missing required fields (task_id, title, image_url)" },
        { status: 400 }
      );
    }

    const result = await pgClient.query(
      `INSERT INTO training_images 
       (task_id, title, description, tag, image_url, product_id, training_data, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending') 
       RETURNING *`,
      [task_id, title, description, tag, image_url, product_id, training_data]
    );

    return NextResponse.json({ 
      success: true, 
      trainingImage: result.rows[0] 
    });
  } catch (error) {
    console.error('Error saving training image:', error);
    return NextResponse.json(
      { error: error.message || "Failed to save training image" },
      { status: 500 }
    );
  }
}