import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    ok: true,
    message: 'Mode demo actif: utilisez les comptes fictifs depuis /auth/login.'
  });
}
