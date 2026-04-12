import { NextResponse } from 'next/server';
import { getAiHealthSnapshot } from '@/services/ai/health-metrics';

export async function GET() {
  return NextResponse.json(getAiHealthSnapshot());
}
