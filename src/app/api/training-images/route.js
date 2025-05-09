import { NextResponse } from 'next/server';
import { pgClient } from '@/helper/database';

export async function GET() {
  try {
    // Get all training images with just the product_id reference
    const result = await pgClient.query(`
      SELECT
        "id",
        "task_id" AS "taskId",
        "title",
        "description",
        "tag",
        "image_url" AS "imageUrl",
        "product_id" AS "productId",
        "training_data" AS "trainingData",
        "status" AS "trainingStatus",
        "created_at" AS "createdAt",
        "updated_at" AS "updatedAt"
      FROM
        "training_images"
      ORDER BY
        "created_at" DESC;
    `);

    return NextResponse.json({ tasks: result.rows });
  } catch (error) {
    console.error('Error fetching training images:', error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch training images" },
      { status: 500 }
    );
  }
}