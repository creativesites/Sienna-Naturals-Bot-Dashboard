import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '7d';

    // In a real implementation, this would query the ai_model_usage table
    // For now, returning mock data that matches the database structure
    const mockData = [
      {
        model_name: "GPT-4o",
        provider: "OpenAI",
        total_requests: 15420,
        success_rate: 98.5,
        avg_response_time: 1200,
        total_cost: 234.56,
        total_tokens: 1250000,
        prompt_tokens: 750000,
        completion_tokens: 500000,
        timeframe
      },
      {
        model_name: "Claude-3.5-Sonnet", 
        provider: "Anthropic",
        total_requests: 8970,
        success_rate: 99.2,
        avg_response_time: 980,
        total_cost: 145.23,
        total_tokens: 890000,
        prompt_tokens: 534000,
        completion_tokens: 356000,
        timeframe
      },
      {
        model_name: "Gemini-Pro",
        provider: "Google",
        total_requests: 5432,
        success_rate: 97.8,
        avg_response_time: 1150,
        total_cost: 89.45,
        total_tokens: 650000,
        prompt_tokens: 390000,
        completion_tokens: 260000,
        timeframe
      }
    ];

    return NextResponse.json(mockData);
  } catch (error) {
    console.error('Error fetching AI model usage:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI model usage data' },
      { status: 500 }
    );
  }
}