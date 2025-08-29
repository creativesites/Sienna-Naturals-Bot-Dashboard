// training/KanbanBoard.js
import OpenAI from "openai";

// Initialize OpenAI client with your API key
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Store your API key in a .env file
});