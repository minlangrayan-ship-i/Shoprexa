import { NextResponse } from 'next/server';
import { recordAiEvent } from '@/services/ai/health-metrics';

export async function POST() {
  recordAiEvent('recommendation_click');
  return NextResponse.json({ ok: true });
}
