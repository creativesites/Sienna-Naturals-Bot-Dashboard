import { NextResponse } from 'next/server';
import PDFParser from 'pdf2json';

export async function POST(request) {
  try {
    const { pdfUrl } = await request.json();

    if (!pdfUrl) {
      return NextResponse.json({ error: 'PDF URL is required' }, { status: 400 });
    }

    // Initialize PDF parser
    const pdfParser = new PDFParser();

    // Fetch PDF file
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch PDF');
    }
    const pdfBuffer = await response.arrayBuffer();

    // Parse PDF
    const text = await new Promise((resolve, reject) => {
      pdfParser.on('pdfParser_dataError', errData => reject(errData));
      pdfParser.on('pdfParser_dataReady', pdfData => {
        const extractedText = pdfData.Pages
          .map(page => page.Texts.map(text => decodeURIComponent(text.R[0].T)).join(' '))
          .join('\n');
        resolve(extractedText);
      });
      pdfParser.parseBuffer(Buffer.from(pdfBuffer));
    });

    // Generate training data
    const trainingData = {
      messages: [
        { role: 'user', content: 'Provide information from the uploaded document' },
        { role: 'assistant', content: text || 'No text extracted from PDF' },
      ],
    };

    return NextResponse.json({
      extractedText: text,
      trainingData: JSON.stringify(trainingData, null, 2),
    });
  } catch (error) {
    console.error('Error extracting PDF:', error);
    return NextResponse.json({ error: 'Failed to extract PDF text' }, { status: 500 });
  }
}