// app/api/verify-code/route.js
import { NextResponse } from 'next/server';

export async function POST(req) {
  const { code } = await req.json();
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';

  console.log('[verify-code] code:', code, 'API:', apiBase);
  console.log('[verify-code] fetching:', `${apiBase}/api/share/${code}`);

  try {
    const res = await fetch(`${apiBase}/api/share/${code}`);
    const body = await res.text();
    console.log('[verify-code] status:', res.status, 'body:', body);

    if (!res.ok) {
      return NextResponse.json({
        valid: false,
        message: 'Invalid or expired code.',
      });
    }

    const data = JSON.parse(body);

    return NextResponse.json({
      valid: true,
      report: data.client ?? data,
    });
  } catch (err) {
    console.error('[verify-code] error:', err);
    return NextResponse.json({
      valid: false,
      message: 'Network error.',
    });
  }
}