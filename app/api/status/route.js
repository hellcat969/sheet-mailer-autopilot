import { NextResponse } from "next/server";
import { getSentCount } from "@/lib/engine";
import { getState } from "@/lib/store";
export const dynamic = "force-dynamic";

export async function GET() {
  const st = await getState();
  let sent = null, ok = st.ok !== false, error = st.error || "";
  try { sent = await getSentCount(); }
  catch (e) { ok = false; error = "Sheet error: " + e.message; }
  return NextResponse.json({ ok, error, sent, lastRun: st.lastRun || null });
}
