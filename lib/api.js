// lib/api.js
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';

export async function fetchShareReport(code) {
  const res = await fetch(API_BASE + '/api/share/' + encodeURIComponent(code), {
    cache: 'no-store',
  });
  if (!res.ok) {
    const msg = res.status === 404 ? 'Code not found or expired' : 'Failed to load report';
    throw new Error(msg);
  }
  return await res.json();
}
