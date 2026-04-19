import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRoles } from '@/lib/api-auth';
import { getAiLabConfig, saveAiLabConfig } from '@/services/ai/ai-lab-config';

const schema = z.object({
  baseModel: z.enum(['llama3', 'mistral_7b']),
  orchestration: z.enum(['langchain', 'llamaindex']),
  outputFormat: z.enum(['structured_json', 'assistant_text']),
  separateSources: z.boolean()
});

export async function GET(request: Request) {
  const access = requireRoles(request, ['ADMIN']);
  if (!access.ok) return access.response;
  return NextResponse.json(getAiLabConfig());
}

export async function POST(request: Request) {
  const access = requireRoles(request, ['ADMIN']);
  if (!access.ok) return access.response;

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const saved = saveAiLabConfig(parsed.data);
  return NextResponse.json(saved);
}

