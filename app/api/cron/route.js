import { NextResponse } from "next/server";
import { runBatch } from "@/lib/engine";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(req) {
  const key = new URL(req.url).searchParams.get("key");
  const bearer = req.headers.get("authorization");
  const okKey = key && key === process.env.APP_PASSWORD;
  const okBearer = process.env.CRON_SECRET && bearer === `Bearer ${process.env.CRON_SECRET}`;
  if (!okKey && !okBearer) return NextResponse.json({ error: "no" }, { status: 401 });
  console.log("cron: starting batch");
  await runBatch({ force: true });
  console.log("cron: batch finished");
  return NextResponse.json({ done: true });
}