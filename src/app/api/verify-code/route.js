// app/api/verify-code/route.js
import { NextResponse } from 'next/server';

export async function POST(req) {
  const { code, language } = await req.json();
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';

  const url = language
    ? `${apiBase}/api/share/${code}?language=${encodeURIComponent(language)}`
    : `${apiBase}/api/share/${code}`;

  console.log('[verify-code] code:', code, 'language:', language);
  console.log('[verify-code] fetching:', url);

  try {
    const res = await fetch(url, { cache: 'no-store' });
    const body = await res.text();
    console.log('[verify-code] status:', res.status);

    if (!res.ok) {
      return NextResponse.json({
        valid: false,
        message: 'Invalid or expired code.',
      });
    }

    let data;
    try {
      data = JSON.parse(body);
    } catch {
      return NextResponse.json({
        valid: false,
        message: 'Invalid response from server.',
      });
    }

    return NextResponse.json({
      valid: true,
      report: data,   // ← hele payloaden, ikke bare data.client
    });
  } catch (err) {
    console.error('[verify-code] error:', err);
    return NextResponse.json({
      valid: false,
      message: err?.message ?? 'Network error.',
    });
  }
}