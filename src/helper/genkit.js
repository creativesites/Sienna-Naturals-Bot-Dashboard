'use server';

import { gemini20Flash, googleAI, gemini25ProExp0325 } from "@genkit-ai/googleai";
import { genkit, z } from "genkit";
import { pgClient } from '@/helper/database';

const ai = genkit({
  plugins: [googleAI({
    apiKey: 'AIzaSyBB5ZYwktOFI3R3j_vs8U7CxwKgS3XNgM0',
  })],
  model: gemini25ProExp0325,
});

async function getAllProducts() {
  try {
    const result = await pgClient.query('SELECT * FROM products');
    return result.rows;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export const analyzeImage = ai.defineFlow(
  {
    name: "analyzeImage",
    inputSchema: z.string(), 
    outputSchema: z.object({
      productName: z.string().nullable(),
      description: z.string(), 
      trainingPairs: z.array(z.object({
        question: z.string(),
        answer: z.string()
      }))
    })
  },
  async (fileUrl, associatedProduct) => {
    const products = await getAllProducts();
    const testUrl = 'https://drive.google.com/file/d/19YLCHxVZoY18OG6mov00_WS_DajMQd70/view?usp=drive_link'
    const analysisPrompt = `
    You are an AI model specializing in extracting structured, chatbot-trainable information from Sienna Naturals marketing images.

    You will be given an image that may contain product usage guides, rituals, comparisons, instructions, or claims. Your goal is to return a structured JSON output that captures the key product details and creates relevant question-answer training pairs for a chatbot.

    Follow these rules:
      1.	Only extract visible text—never invent information.
      2.	If a product name is visible and matches a known product, return it; otherwise, set "productName" to null.
      3.	Provide a concise but meaningful description using only the extracted text.
      4.	Create 1-3 high-quality Q&A training pairs, ensuring both question and answer strictly reflect the image content.
      5.	The output must be valid JSON, where:
      •	"description" is always a single string (not an array).
      •	"trainingPairs" is an array of objects with "question" and "answer".

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
    given image url: ${fileUrl}
    associated product: ${associatedProduct?JSON.stringify(associatedProduct):''}
    all other Sienna Naturals products for context: ${products??JSON.stringify(products)}
    `;

    const { output } = await ai.generate({
      model: gemini25ProExp0325,
      prompt: analysisPrompt,
      image: { url: testUrl },
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
        result.trainingPairs = [];
      }
    }

    // Ensure description is a string
    if (Array.isArray(result.description)) {
      result.description = result.description.join('\n');
    }

    return result;
  }
);