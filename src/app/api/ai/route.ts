import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { config } from '@/config/env';

const openai = new OpenAI({
  apiKey: config.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Missing prompt' },
        { status: 400 }
      );
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that provides dance class recommendations.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 150,
    });

    return NextResponse.json({
      suggestions: response.choices[0].message.content,
    });
  } catch (error) {
    console.error('Error getting AI recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to get AI recommendations' },
      { status: 500 }
    );
  }
} 