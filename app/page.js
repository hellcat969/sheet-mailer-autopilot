"use client";
import { useEffect, useState } from "react";
import {
  Grid3x3, Mail, ShieldCheck, Lock, Users, Headphones,
  MapPin, Clock, AlertTriangle, CheckCircle2, LoaderCircle,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Global CSS (injected as raw HTML so React never HTML-escapes it,   */
/*  which is what caused the hydration mismatch)                       */
/* ------------------------------------------------------------------ */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&display=swap');
@keyframes sweep { from { transform: translateY(-100%); } to { transform: translateY(100%); } }
@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
@media (prefers-reduced-motion: reduce) { .motion-safe-anim { animation: none !important; } }
`;

/* fluid size helper: clamp(min px, container-relative, max px) */
const cl = (min, cq, max) => `clamp(${min}px, ${cq}cqw, ${max}px)`;

/* ------------------------------------------------------------------ */
/*  Small UI helpers                                                   */
/* ------------------------------------------------------------------ */
function Frame({ children, className = "", style }) {
  const c = "absolute w-2 h-2 border-white pointer-events-none";
  return (
    <div style={style} className={`relative bg-black/90 border border-white/15 backdrop-blur-md ${className}`}>
      <span className={`${c} -top-px -left-px border-t border-l`} />
      <span className={`${c} -top-px -right-px border-t border-r`} />
      <span className={`${c} -bottom-px -left-px border-b border-l`} />
      <span className={`${c} -bottom-px -right-px border-b border-r`} />
      {children}
    </div>
  );
}

function SegmentBar({ pct }) {
  const total = 40;
  const on = Math.round(pct * total);
  return (
    <div className="flex items-center gap-[2px] w-full h-5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`flex-1 min-w-[2px] ${i === on ? "h-5 bg-white" : "h-3"} ${
            i < on ? "bg-white" : i === on ? "" : "bg-white/20"
          }`}
        />
      ))}
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Good night";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

/* ------------------------------------------------------------------ */
/*  Laptop. Everything inside scales with the laptop's own width (cqw) */
/* ------------------------------------------------------------------ */
const BARS = Array.from({ length: 24 }, (_, i) => 28 + Math.round(60 * Math.abs(Math.sin(i * 0.62 + 0.9))));

function Laptop({ state, report, sent, lastRun, left, pct, mounted }) {
  const filled = mounted ? Math.round(pct * BARS.length) : 0;
  const label = state === "ok" ? "OPERATIONAL" : state === "fault" ? "FAULT" : "CHECKING";
  const pad = cl(10, 1.7, 22);
  const gap = cl(8, 1.4, 18);
  const tiny = cl(9, 1, 12);
  const small = cl(11, 1.2, 15);

  return (
    <div className="w-full [container-type:inline-size]">
      <div className="motion-safe-anim" style={{ animation: "float 7s ease-in-out infinite" }}>
        {/* ---------- lid ---------- */}
        <div
          className="relative bg-[#050505] border border-white/40"
          style={{
            padding: "clamp(6px, 1.5cqw, 16px)",
            borderRadius: "clamp(8px, 1.6cqw, 18px) clamp(8px, 1.6cqw, 18px) 4px 4px",
            boxShadow: "0 0 60px rgba(255,255,255,0.12), inset 0 0 0 1px rgba(255,255,255,0.06)",
          }}
        >
          {/* camera */}
          <span
            className="absolute left-1/2 -translate-x-1/2 rounded-full bg-white/40"
            style={{ top: "clamp(2px, 0.5cqw, 6px)", width: "clamp(3px, 0.5cqw, 5px)", height: "clamp(3px, 0.5cqw, 5px)" }}
          />

          {/* ---------- screen ---------- */}
          <div className="relative overflow-hidden bg-black border border-white/15 rounded-[4px] flex flex-col md:aspect-[16/10]">
            {/* window bar */}
            <div className="flex items-center justify-between border-b border-white/15 shrink-0" style={{ padding: `${cl(6, 0.9, 12)} ${pad}` }}>
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="rounded-full border border-white/50 w-2 h-2" />
                ))}
              </div>
              <span className="text-white/70 tracking-widest" style={{ fontSize: tiny }}>
                OUTREACH AUTO-PILOT
              </span>
              <span className="w-8 sm:w-10" />
            </div>

            {/* body: the three status cards */}
            <div
              className="grid grid-cols-1 md:grid-cols-[1.05fr_1fr] flex-1 min-h-0"
              style={{ gap, padding: pad }}
            >
              {/* LEFT: emails sent */}
              <Frame className="flex flex-col" style={{ padding: pad }}>
                <span className="text-white/60 tracking-widest" style={{ fontSize: tiny }}>
                  EMAILS SENT
                </span>
                <div
                  className="font-light tracking-tight tabular-nums leading-none"
                  style={{
                    fontSize: cl(40, 6.6, 84),
                    marginTop: cl(8, 1.2, 16),
                    textShadow: "0 0 24px rgba(255,255,255,0.35)",
                  }}
                >
                  {sent}
                </div>

                <div
                  className="flex items-end gap-[3px]"
                  style={{ height: cl(44, 8, 100), marginTop: cl(12, 2, 24) }}
                >
                  {BARS.map((h, i) => (
                    <span
                      key={i}
                      className={`flex-1 ${i < filled ? "bg-white" : "bg-white/20"} ${
                        i === filled ? "motion-safe-anim animate-pulse !bg-white/70" : ""
                      }`}
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>

                <div
                  className="mt-auto border-t border-white/15 flex justify-between gap-2 text-white/70"
                  style={{ fontSize: small, paddingTop: cl(8, 1.2, 14), marginTop: cl(12, 2, 22) }}
                >
                  <span>
                    Last run <span className="text-white">{lastRun}</span>
                  </span>
                  <span>
                    Next <span className="text-white tabular-nums">{mounted ? left : "--:--"}</span>
                  </span>
                </div>
              </Frame>

              {/* RIGHT: status + progress */}
              <div className="flex flex-col" style={{ gap }}>
                <Frame className="flex-1" style={{ padding: pad }}>
                  <div className="flex items-center justify-between gap-2" style={{ marginBottom: cl(8, 1.2, 14) }}>
                    <span className="text-white/60 tracking-widest" style={{ fontSize: tiny }}>
                      SYSTEM STATUS
                    </span>
                    <span
                      className={`flex items-center gap-1.5 px-1.5 py-0.5 border ${
                        state === "fault" ? "bg-white text-black border-white font-semibold" : "border-white/40"
                      }`}
                      style={{ fontSize: tiny }}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          state === "fault" ? "bg-black" : "bg-white motion-safe-anim animate-pulse"
                        }`}
                      />
                      {label}
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    {state === "ok" && <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" strokeWidth={1.5} />}
                    {state === "fault" && <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" strokeWidth={1.5} />}
                    {state === "checking" && (
                      <LoaderCircle className="w-4 h-4 mt-0.5 shrink-0 animate-spin motion-safe-anim" strokeWidth={1.5} />
                    )}
                    <p className="leading-relaxed text-white/90" style={{ fontSize: small }}>
                      {report}
                    </p>
                  </div>
                </Frame>

                <Frame style={{ padding: pad }}>
                  <div className="flex items-center justify-between gap-3">
                    <SegmentBar pct={mounted ? pct : 0} />
                    <span className="tabular-nums shrink-0" style={{ fontSize: small }}>
                      {mounted ? Math.round(pct * 100) : 0}%
                    </span>
                  </div>
                  <p className="text-white/50 tracking-widest" style={{ fontSize: tiny, marginTop: cl(6, 1, 12) }}>
                    HOURLY CYCLE PROGRESS
                  </p>
                </Frame>
              </div>
            </div>

            {/* glass glare */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "linear-gradient(115deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0) 30%)" }}
            />
          </div>
        </div>

        {/* ---------- keyboard deck ---------- */}
        <div
          className="relative mx-auto"
          style={{
            width: "108%",
            marginLeft: "-4%",
            height: "clamp(22px, 6.5cqw, 64px)",
            clipPath: "polygon(4% 0, 96% 0, 100% 100%, 0 100%)",
            background: "linear-gradient(180deg, #161616 0%, #0a0a0a 100%)",
          }}
        >
          <div
            className="absolute"
            style={{
              left: "8%", right: "8%", top: "14%", height: "50%",
              backgroundImage:
                "repeating-linear-gradient(90deg, rgba(255,255,255,0.22) 0 1px, transparent 1px 3.6%), repeating-linear-gradient(0deg, rgba(255,255,255,0.22) 0 1px, transparent 1px 25%)",
              opacity: 0.55,
            }}
          />
          <div
            className="absolute left-1/2 -translate-x-1/2 border border-white/25"
            style={{ bottom: "8%", width: "16%", height: "18%" }}
          />
        </div>

        {/* front lip with notch */}
        <div
          className="relative mx-auto bg-[#1b1b1b] border border-white/30"
          style={{
            width: "108%",
            marginLeft: "-4%",
            height: "clamp(6px, 1cqw, 12px)",
            borderRadius: "0 0 clamp(8px, 2cqw, 22px) clamp(8px, 2cqw, 22px)",
          }}
        >
          <span
            className="absolute left-1/2 -translate-x-1/2 top-0 bg-black border-x border-b border-white/30"
            style={{ width: "12%", height: "clamp(2px, 0.45cqw, 5px)", borderRadius: "0 0 6px 6px" }}
          />
        </div>

        {/* ground glow */}
        <div
          className="mx-auto"
          style={{
            width: "100%",
            height: "clamp(14px, 4cqw, 40px)",
            marginTop: "clamp(6px, 1.5cqw, 16px)",
            background: "radial-gradient(ellipse at center, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 70%)",
            filter: "blur(6px)",
          }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function Home() {
  const [d, setD] = useState(null);
  const [left, setLeft] = useState("--:--");
  const [pct, setPct] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [utcTime, setUtcTime] = useState("--:--:--");
  const [hello, setHello] = useState("Hello");

  useEffect(() => {
    setMounted(true);
    setHello(greeting());

    const clock = setInterval(() => {
      setUtcTime(new Date().toUTCString().split(" ")[4] || "00:00:00");
    }, 1000);

    const load = () =>
      fetch("/api/status")
        .then((r) => r.json())
        .then(setD)
        .catch(() =>
          setD((prev) => ({ ...(prev || {}), ok: false, error: "Cannot reach the telemetry server." }))
        );
    load();
    const poll = setInterval(load, 10000);

    const tick = () => {
      const n = new Date();
      const next = new Date(n);
      next.setHours(n.getHours() + 1, 0, 0, 0);
      const s = Math.floor((next.getTime() - n.getTime()) / 1000);
      setLeft(`${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`);
      setPct(1 - s / 3600);
    };
    tick();
    const countdown = setInterval(tick, 1000);

    return () => {
      clearInterval(clock);
      clearInterval(poll);
      clearInterval(countdown);
    };
  }, []);

  /* ---- status ---- */
  const state = !d ? "checking" : d.ok ? "ok" : "fault";
  const sent = typeof d?.sent === "number" ? d.sent.toLocaleString() : d?.sent ?? "—";
  const lastRun = d?.lastRun ? new Date(d.lastRun).toLocaleTimeString() : "—";

  const report =
    state === "ok"
      ? `${hello}, Sarmad. Outreach Auto-pilot is running and every routine is working as expected.`
      : state === "fault"
      ? `Sarmad, Outreach Auto-pilot needs your attention. ${d?.error || "An error was detected."}`
      : "Checking the system. One moment, Sarmad.";

  return (
    <div
      className="relative w-full min-h-screen overflow-x-hidden bg-black text-white selection:bg-white selection:text-black lg:h-screen lg:overflow-hidden"
      style={{ fontFamily: "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace" }}
    >
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />

      {/* ============ BACKDROP ============ */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_55%,rgba(255,255,255,0.10),transparent_55%)]" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.85)_100%)]" />
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.07]">
        <div
          className="motion-safe-anim absolute inset-x-0 h-1/3 bg-gradient-to-b from-transparent via-white to-transparent"
          style={{ animation: "sweep 9s linear infinite" }}
        />
      </div>

      {/* ============ UI ============ */}
      <div className="relative z-10 min-h-screen lg:h-full flex gap-3 sm:gap-4 p-3 sm:p-4">
        {/* Icon rail */}
        <Frame className="hidden sm:flex w-14 shrink-0 flex-col items-center justify-between py-4">
          <div className="flex flex-col items-center gap-5">
            <Grid3x3 className="w-5 h-5 text-white/80" strokeWidth={1.5} />
            <span className="w-6 h-px bg-white/15" />
            <span className="p-2 border border-white">
              <Mail className="w-5 h-5" strokeWidth={1.5} />
            </span>
            <ShieldCheck className="w-5 h-5 text-white/50" strokeWidth={1.5} />
            <Lock className="w-5 h-5 text-white/50" strokeWidth={1.5} />
            <Users className="w-5 h-5 text-white/50" strokeWidth={1.5} />
          </div>
          <Headphones className="w-5 h-5 text-white/50" strokeWidth={1.5} />
        </Frame>

        <div className="flex-1 flex flex-col gap-3 sm:gap-4 min-w-0">
          {/* Top bar */}
          <Frame className="px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border border-white flex items-center justify-center">
                <Mail className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <span className="text-sm sm:text-base font-medium tracking-wide">Outreach Auto-pilot</span>
            </div>

            <div className="flex items-center gap-5 text-xs text-white/70">
              <span className="hidden md:flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" /> GRID SECTOR 7
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" /> {utcTime} UTC
              </span>
            </div>
          </Frame>

          {/* Laptop area: right side on large screens, centered on small */}
          <div className="flex-1 min-h-0 flex items-center justify-center px-1 sm:px-4 pb-4">
            <div className="w-full md:w-[min(80%,660px)] lg:w-[min(56vw,860px)]">
              <Laptop
                state={state}
                report={report}
                sent={sent}
                lastRun={lastRun}
                left={left}
                pct={pct}
                mounted={mounted}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}