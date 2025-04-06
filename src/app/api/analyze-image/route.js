// app/api/analyze-image/route.ts

import { analyzeImage } from '@/helper/genkit';
import { NextResponse } from 'next/server';

export const config = {
  runtime: 'edge'
};

export async function POST(request) {
  try {
    let result = null;
  if (process.env.BUILD_ENVIRONMENT !== 'local') {
    const { imageUrl, associatedProduct } = await request.json();
    console.log('analysis api recieved img url is:', imageUrl)
    if (!imageUrl) {
      return NextResponse.json(
        { error: "imageUrl is required" },
        { status: 400 }
      );
    }

    result = await analyzeImage(imageUrl, associatedProduct);
    console.log('result', result)
  }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error.message || "Analysis failed" },
      { status: 500 }
    );
  }
}