import { NextResponse } from "next/server";
import { runBatch } from "@/lib/engine";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

// For Vercel / external pingers: GET /api/cron?key=APP_PASSWORD (or Bearer CRON_SECRET)
export async function GET(req) {
  const key = new URL(req.url).searchParams.get("key");
  const bearer = req.headers.get("authorization");
  const okKey = key && key === process.env.APP_PASSWORD;
  const okBearer = process.env.CRON_SECRET && bearer === `Bearer ${process.env.CRON_SECRET}`;
  if (!okKey && !okBearer) return NextResponse.json({ error: "no" }, { status: 401 });
  await runBatch();
  return NextResponse.json({ done: true });
}
