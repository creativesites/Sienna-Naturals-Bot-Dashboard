import { uploadFile } from '@/helper/storage';
import { NextResponse } from 'next/server';

export const config = {
  api: {
    bodyParser: false, // Disable default body parsing for FormData
  },
};

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer - COMPATIBLE APPROACH
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '-')}`;
    const contentType = file.type;

    // Upload to GCP
    const url = await uploadFile(fileBuffer, fileName, contentType);
    console.log('the url form api', url)

    return NextResponse.json({ url });
  } catch (error) {
    console.log('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}