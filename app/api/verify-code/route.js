// app/api/verify-code/route.js
// Server-side proxy that hits the Coachly backend with the share code.
// Coachly's GET /api/share/:code returns { client, stats, logs, scores, ... }
// directly (no { success, data } wrapper).

import { NextResponse } from "next/server";

const API = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5050";

export async function POST(req) {
  const { code } = await req.json().catch(() => ({}));
  console.log("[verify-code] code:", code, "API:", API);

  if (!/^\d{6}$/.test(code?.trim() ?? "")) {
    return NextResponse.json({ valid: false, message: "Invalid code format" });
  }

  const url = `${API}/api/share/${code.trim()}`;
  console.log("[verify-code] fetching:", url);

  try {
    const res = await fetch(url, { cache: "no-store" });
    const text = await res.text();
    console.log("[verify-code] status:", res.status, "body length:", text.length);

    let json;
    try {
      json = JSON.parse(text);
    } catch {
      return NextResponse.json({ valid: false, message: "Bad response from API" });
    }

    if (!res.ok) {
      return NextResponse.json({
        valid: false,
        message: json?.error ?? json?.message ?? `API returned ${res.status}`,
      });
    }

    // Coachly returns the report directly. Wrap it under `report` for the client.
    if (!json?.client || !Array.isArray(json?.logs)) {
      return NextResponse.json({
        valid: false,
        message: "Unexpected response shape",
      });
    }

    return NextResponse.json({ valid: true, report: json });
  } catch (e) {
    console.error("[verify-code] fetch error:", e.message);
    return NextResponse.json({ valid: false, message: e.message });
  }
}
