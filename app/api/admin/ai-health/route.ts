import { NextResponse } from 'next/server';
import { requireRoles } from '@/lib/api-auth';
import { getAiHealthSnapshot } from '@/services/ai/health-metrics';

export async function GET(request: Request) {
  const access = requireRoles(request, ['ADMIN']);
  if (!access.ok) return access.response;
  return NextResponse.json(getAiHealthSnapshot());
}
