import { NextResponse } from 'next/server';
import { z } from 'zod';
import { buildChatAssistantReply } from '@/services/ai/chat-assistant';
import { recordAiMetric } from '@/services/ai/health-metrics';

const ROUTE_KEY = '/api/ai/chat';

const schema = z.object({
  message: z.string().min(2),
  locale: z.enum(['fr', 'en']).default('fr'),
  country: z.string().min(2),
  city: z.string().min(2),
  history: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })).default([])
});

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      recordAiMetric(ROUTE_KEY, { error: true });
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const result = await buildChatAssistantReply(parsed.data);
    recordAiMetric(ROUTE_KEY, { fallback: result.fallbackUsed });
    return NextResponse.json(result);
  } catch {
    recordAiMetric(ROUTE_KEY, { error: true, fallback: true });
    return NextResponse.json({ error: 'chat_internal_error' }, { status: 500 });
  }
}
