
'use server';

import vision from '@google-cloud/vision';
import { gemini20Flash, googleAI, gemini25ProExp0325 } from "@genkit-ai/googleai";
import { genkit, z } from "genkit";
import { pgClient } from '@/helper/database';

const ai = genkit({
  plugins: [googleAI({
    apiKey: process.env.GENKIT_API_KEY,
  })],
  model: gemini25ProExp0325,
});

export async function getVisionClient() {
  const {
    GCLOUD_PROJECT_ID,
    GCLOUD_CLIENT_EMAIL,
    GCLOUD_PRIVATE_KEY
  } = process.env;

  if (!GCLOUD_PROJECT_ID || !GCLOUD_CLIENT_EMAIL || !GCLOUD_PRIVATE_KEY) {
    throw new Error('Missing Google Cloud credentials in environment variables');
  }

  return new vision.ImageAnnotatorClient({
    projectId: GCLOUD_PROJECT_ID,
    credentials: {
      client_email: GCLOUD_CLIENT_EMAIL,
      private_key: GCLOUD_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }
  });
}

export const postAnalyzeImage = ai.defineFlow(
  {
    name: "analyzeImage",
    inputSchema: z.object({
      productName: z.string().nullable(),
      title: z.string(),
      tag: z.string(),
      description: z.string(),
      associatedProduct: z.any().optional(),
    }), 
    outputSchema: z.object({
      productName: z.string().nullable(),
      description: z.string(), 
      trainingPairs: z.array(z.object({
        question: z.string(),
        answer: z.string()
      }))
    })
  },
  async ({ productName, title, tag, description, associatedProduct }) => {

    console.log('ai refiner recieved desc', description)
    console.log('ai recieved data:', associatedProduct, title, tag, productName)
    //const products = await getAllProducts();
    //const testUrl = 'https://drive.google.com/file/d/19YLCHxVZoY18OG6mov00_WS_DajMQd70/view?usp=drive_link'
    const analysisPrompt = `
    You are an AI model specializing in extracting structured, chatbot-trainable information from text extracted from image only. you are not to create any additional questions based on given product.
    You are to only work with generating questions only from text extracted from image. You are to only refine text extracted from image, only adding the product name, if any only and refining the content for in-context chatbot training without changing any of the information.
    The questions should be giuded by the usern given title ${title} and tag ${tag}.
    - ONLY use the image text provided (do not hallucinate or invent new facts).
    - Use the given product name (if any) to enhance the result.
    - The title and tag are meant to guide the style and content of the questions.
    - The associated product (if any) may be used to align and clarify the context.

   You will be given the image text already extracted using vision api. Your goal is to return a structured JSON output that captures the key product details and creates relevant question-answer training pairs for a chatbot in-context training as well as model fine tuning.

    Follow these rules:
      1.  The product for the text in question is provided, refine the description and training pairs question and answers reconciling them with the product details.
      
      • "description" is always a single string (not an array).
      • "trainingPairs" is an array of objects with "question" and "answer".

    Example Output Format:
    {
      "productName": "Mini Repair Ritual",
      "description": "Where this fits into your ritual - Mini Repair Ritual. This product provides shampoo, mask, and leave-in, covering half of Sienna Naturals' hair ritual, which consists of shampoo, mask/conditioner, leave-in, styler, and treatment.",
      "trainingPairs": [
        {
          "question": "How does the Mini Repair Ritual fit into my hair care routine?",
          "answer": "The Mini Repair Ritual includes a shampoo, mask, and leave-in, covering half of the full Sienna Naturals ritual: shampoo, mask/conditioner, leave-in, styler, and treatment."
        },
        {
          "question": "What are the steps in the Sienna Naturals hair ritual?",
          "answer": "The full Sienna Naturals hair ritual consists of five steps: shampoo, mask or conditioner, leave-in, styler, and treatment."
        }
      ]
    }
    text extracted from image: ${description}
    productName: ${productName}
    user given title for training image: ${title}
    user given tag for training image: ${tag}
    the product is: ${associatedProduct?JSON.stringify(associatedProduct):''}
    `;

    const { output } = await ai.generate({
      model: gemini25ProExp0325,
      prompt: analysisPrompt,
      config: { 
        temperature: 0.3,
        responseMimeType: "application/json" 
      }
    });

    // Transform the output to match schema if needed
    const result = typeof output === 'string' ? JSON.parse(output) : output;
    
    // Ensure trainingPairs exists and is properly formatted
    if (!result.trainingPairs && result.trainingData) {
      try {
        result.trainingPairs = result.trainingData.split('\n')
          .filter(line => line.trim())
          .map(line => JSON.parse(line));
        delete result.trainingData;
      } catch (e) {
        console.log(e)
        result.trainingPairs = [];
      }
    }
    //result.productName = associatedProduct.name

    // Ensure description is a string
    if (Array.isArray(result.description)) {
      result.description = result.description.join('\n');
    }

    return result;
  }
);
export async function analyzeImage(fileUrl, associatedProduct, title, tag) {
  try {
    const client = await getVisionClient();
    console.log('recieved data:', associatedProduct, title, tag)
    // Vision expects a `gs://` URL, so convert public URL to that
    const gsUrl = fileUrl.replace(
      'https://storage.googleapis.com/sienna-naturals-files-upload/',
      'gs://sienna-naturals-files-upload/'
    );

    const [result] = await client.textDetection(gsUrl);
    const detections = result.textAnnotations;
    const extractedText = detections.length > 0 ? detections[0].description : '';

    // Extract product name if it's in the text (basic check)
    const knownProductName = associatedProduct?.name || null;
    const productName = extractedText.includes(knownProductName) ? knownProductName : null;

    console.log('extracted text:', extractedText)

    // Generate basic training pairs from text
    const trainingPairs = [];

    if (extractedText) {
      trainingPairs.push({
        question: `What does this image say about ${productName || 'the product'}?`,
        answer: extractedText.trim(),
      });

      if (title) {
        trainingPairs.push({
          question: `What is the image titled "${title}" about?`,
          answer: extractedText.trim(),
        });
      }
    }
    let parsedAssociatedProduct = associatedProduct;

if (typeof associatedProduct === 'string') {
  try {
    parsedAssociatedProduct = JSON.parse(associatedProduct);
  } catch (err) {
    console.warn('Failed to parse associatedProduct:', err);
    parsedAssociatedProduct = null; // fallback or keep as string depending on your needs
  }
}
const safeTag = typeof tag === 'string' ? tag : '';
const safeTitle = typeof title === 'string' ? title : '';
const refinedResponse = await postAnalyzeImage({
  productName: knownProductName,
  title: safeTitle,
  tag: safeTag,
  description: extractedText.trim(),
  associatedProduct: parsedAssociatedProduct,
});
    return refinedResponse;
  } catch (error) {
    console.error("OCR error:", error);
    return {
      productName: null,
      description: '',
      trainingPairs: []
    };
  }
}