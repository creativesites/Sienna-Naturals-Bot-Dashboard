import { NextResponse } from 'next/server';
import { pgClient } from '@/helper/database';

export async function GET(request, { params }) {
  try {
    const { taskId } = params;
    const result = await pgClient.query(
      `SELECT ti.*, p.name as product_name
       FROM training_images ti
       LEFT JOIN products p ON ti.product_id = p.product_id
       WHERE ti.task_id = $1`,
      [taskId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ task: result.rows[0] });
  } catch (error) {
    console.error('Error fetching training image:', error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch training image" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { taskId } = await params;

    if (!taskId) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }
    const {
      title,
      description,
      tag,
      image_url,
      product_id,
      training_data,
      trainingStatus
    } = await request.json();

    const parsedTrainingData = JSON.stringify(training_data)

     // Handle training_data conversion
//     let parsedTrainingData = null;
//     if (training_data) {
//       try {
//         // If it's already an object, use it directly
//         if (typeof training_data === 'object' && training_data !== null) {
//           parsedTrainingData = training_data;
//         }
//         // If it's a string, try to parse it
//         else if (typeof training_data === 'string') {
//           parsedTrainingData = JSON.parse(training_data);
//         }
//       } catch (e) {
//         console.error('Error parsing training_data:', e);
//         return NextResponse.json(
//           { error: "Invalid training_data format" },
//           { status: 400 }
//         );
//       }
//     }
//    console.log(parsedTrainingData)

    const result = await pgClient.query(
      `UPDATE training_images
       SET
         title = $1,
         description = $2,
         tag = $3,
         image_url = $4,
         product_id = $5,
         training_data = $6,
         status = $7,
         updated_at = CURRENT_TIMESTAMP
       WHERE task_id = $8
       RETURNING *`,
      [
        title,
        description,
        tag,
        image_url,
        product_id,
        parsedTrainingData,
        trainingStatus,
        taskId
      ]
    );

    return NextResponse.json({ task: result.rows[0] });
  } catch (error) {
    console.error('Error updating training image:', error);
    return NextResponse.json(
      { error: error.message || "Failed to update training image" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { taskId } = params;
    await pgClient.query(
      'DELETE FROM training_images WHERE task_id = $1',
      [taskId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting training image:', error);
    return NextResponse.json(
      { error: error.message || "Failed to delete training image" },
      { status: 500 }
    );
  }
}