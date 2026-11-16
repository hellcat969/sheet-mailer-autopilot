"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Grid3x3, Mail, ShieldCheck, Lock, Users, Headphones,
  MapPin, Clock, Plus, Minus, Maximize2, AlertTriangle, CheckCircle2, LoaderCircle,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Decorative map data (pure visuals, no functionality attached)      */
/* ------------------------------------------------------------------ */
const MAP_W = 2000;
const MAP_H = 1300;

const PEAKS = [
  { cx: 880, cy: 520, r: 300, rings: 16, ph: 0.4 },
  { cx: 1280, cy: 440, r: 240, rings: 13, ph: 1.7 },
  { cx: 1120, cy: 800, r: 280, rings: 15, ph: 2.9 },
  { cx: 640, cy: 780, r: 220, rings: 12, ph: 4.1 },
  { cx: 1560, cy: 760, r: 200, rings: 10, ph: 5.2 },
  { cx: 420, cy: 360, r: 180, rings: 9, ph: 0.9 },
  { cx: 1500, cy: 1030, r: 190, rings: 9, ph: 3.3 },
];

const SPOTS = [
  { x: 880, y: 520, label: "NODE 01" },
  { x: 1280, y: 440, label: "NODE 02" },
  { x: 1120, y: 800, label: "NODE 03" },
  { x: 640, y: 780, label: "NODE 04" },
];

function buildContours() {
  const out = [];
  PEAKS.forEach((p, pi) => {
    for (let k = 1; k <= p.rings; k++) {
      const base = (p.r * k) / p.rings;
      const pts = [];
      for (let i = 0; i < 96; i++) {
        const a = (i / 96) * Math.PI * 2;
        const wob =
          1 +
          0.16 * Math.sin(3 * a + p.ph + k * 0.15) +
          0.09 * Math.sin(5 * a + p.ph * 2 - k * 0.1) +
          0.05 * Math.sin(9 * a + p.ph * 3);
        const rr = base * wob;
        pts.push(`${(p.cx + Math.cos(a) * rr * 1.25).toFixed(1)},${(p.cy + Math.sin(a) * rr * 0.9).toFixed(1)}`);
      }
      out.push({
        id: `${pi}-${k}`,
        d: `M${pts.join("L")}Z`,
        major: k % 4 === 0,
        o: 0.12 + (k / p.rings) * 0.3,
      });
    }
  });
  return out;
}

/* ------------------------------------------------------------------ */
/*  Small UI helpers                                                   */
/* ------------------------------------------------------------------ */
function Frame({ children, className = "" }) {
  const c = "absolute w-2.5 h-2.5 border-white pointer-events-none";
  return (
    <div className={`relative bg-black/90 border border-white/15 backdrop-blur-md ${className}`}>
      <span className={`${c} -top-px -left-px border-t border-l`} />
      <span className={`${c} -top-px -right-px border-t border-r`} />
      <span className={`${c} -bottom-px -left-px border-b border-l`} />
      <span className={`${c} -bottom-px -right-px border-b border-r`} />
      {children}
    </div>
  );
}

function SegmentBar({ pct }) {
  const total = 44;
  const on = Math.round(pct * total);
  return (
    <div className="flex items-center gap-[3px] h-6">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`w-[3px] ${i === on ? "h-6 bg-white" : "h-4"} ${i < on ? "bg-white" : i === on ? "" : "bg-white/20"}`}
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
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function Home() {
  const [d, setD] = useState(null);
  const [left, setLeft] = useState("--:--");
  const [pct, setPct] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [utcTime, setUtcTime] = useState("--:--:--");
  const [hello, setHello] = useState("Hello");

  // map pan / zoom
  const viewRef = useRef(null);
  const drag = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);

  const contours = useMemo(buildContours, []);

  const centerMap = (z = 1) => {
    const el = viewRef.current;
    if (!el) return;
    setZoom(z);
    setPos({
      x: (el.clientWidth - MAP_W * z) / 2,
      y: (el.clientHeight - MAP_H * z) / 2,
    });
  };

  useEffect(() => {
    setMounted(true);
    setHello(greeting());
    centerMap(1);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- drag handlers ---- */
  const clamp = (x, y, z) => {
    const el = viewRef.current;
    if (!el) return { x, y };
    const minX = Math.min(0, el.clientWidth - MAP_W * z);
    const minY = Math.min(0, el.clientHeight - MAP_H * z);
    return { x: Math.max(minX, Math.min(0, x)), y: Math.max(minY, Math.min(0, y)) };
  };
  const onDown = (e) => {
    drag.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y };
    setDragging(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e) => {
    if (!drag.current) return;
    setPos(clamp(drag.current.ox + e.clientX - drag.current.sx, drag.current.oy + e.clientY - drag.current.sy, zoom));
  };
  const onUp = () => {
    drag.current = null;
    setDragging(false);
  };
  const changeZoom = (delta) => {
    const z = Math.max(0.6, Math.min(1.6, +(zoom + delta).toFixed(2)));
    const el = viewRef.current;
    if (!el) return setZoom(z);
    // zoom around viewport centre
    const cx = el.clientWidth / 2;
    const cy = el.clientHeight / 2;
    const k = z / zoom;
    setZoom(z);
    setPos(clamp(cx - (cx - pos.x) * k, cy - (cy - pos.y) * k, z));
  };

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
      className="h-screen w-screen relative overflow-hidden bg-black text-white selection:bg-white selection:text-black"
      style={{ fontFamily: "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&display=swap');
        @keyframes sweep { from { transform: translateY(-100%);} to { transform: translateY(100%);} }
        @media (prefers-reduced-motion: reduce) { .motion-safe-anim { animation: none !important; } }
      `}</style>

      {/* ============ MOVEABLE MAP ============ */}
      <div
        ref={viewRef}
        className={`absolute inset-0 touch-none select-none ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        {mounted && (
          <div
            className="absolute top-0 left-0 origin-top-left"
            style={{
              width: MAP_W,
              height: MAP_H,
              transform: `translate(${pos.x}px, ${pos.y}px) scale(${zoom})`,
              transition: dragging ? "none" : "transform 0.25s ease-out",
            }}
          >
            <svg width={MAP_W} height={MAP_H} viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="block">
              <defs>
                <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M50 0H0V50" fill="none" stroke="#fff" strokeOpacity="0.05" strokeWidth="1" />
                </pattern>
                <radialGradient id="glow">
                  <stop offset="0%" stopColor="#fff" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width={MAP_W} height={MAP_H} fill="#000" />
              <rect width={MAP_W} height={MAP_H} fill="url(#grid)" />

              {contours.map((c) => (
                <path
                  key={c.id}
                  d={c.d}
                  fill="none"
                  stroke="#fff"
                  strokeOpacity={c.major ? c.o + 0.18 : c.o * 0.7}
                  strokeWidth={c.major ? 1.4 : 0.8}
                />
              ))}

              {/* glowing spots */}
              {SPOTS.map((s, i) => (
                <g key={s.label}>
                  <circle cx={s.x} cy={s.y} r="70" fill="url(#glow)" />
                  <circle
                    cx={s.x}
                    cy={s.y}
                    r="14"
                    fill="none"
                    stroke="#fff"
                    strokeOpacity="0.8"
                    className="motion-safe-anim animate-ping"
                    style={{ transformOrigin: `${s.x}px ${s.y}px`, animationDelay: `${i * 0.6}s`, animationDuration: "2.6s" }}
                  />
                  <rect x={s.x - 7} y={s.y - 7} width="14" height="14" fill="#fff" />
                  <rect x={s.x - 14} y={s.y - 14} width="28" height="28" fill="none" stroke="#fff" strokeOpacity="0.6" />
                  <rect x={s.x + 22} y={s.y - 10} width="78" height="20" fill="#000" stroke="#fff" strokeOpacity="0.3" />
                  <text x={s.x + 30} y={s.y + 4} fill="#fff" fontSize="11" letterSpacing="1.5">
                    {s.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        )}
      </div>

      {/* vignette + scan line */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.9)_100%)]" />
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.07]">
        <div className="motion-safe-anim absolute inset-x-0 h-1/3 bg-gradient-to-b from-transparent via-white to-transparent" style={{ animation: "sweep 9s linear infinite" }} />
      </div>

      {/* ============ UI OVERLAY ============ */}
      <div className="absolute inset-0 pointer-events-none p-3 sm:p-4 flex gap-3 sm:gap-4">
        {/* Icon rail */}
        <Frame className="pointer-events-auto hidden sm:flex w-14 flex-col items-center justify-between py-4">
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
          <Frame className="pointer-events-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
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

          {/* Content area */}
          <div className="flex-1 min-h-0 relative">
            {/* Status column */}
            <div className="pointer-events-auto absolute left-0 top-0 w-full sm:w-[360px] flex flex-col gap-3 sm:gap-4 max-h-full overflow-y-auto">
              {/* System status */}
              <Frame className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] text-white/60 tracking-widest">SYSTEM STATUS</span>
                  <span
                    className={`flex items-center gap-2 text-[11px] px-2 py-0.5 border ${
                      state === "fault" ? "bg-white text-black border-white font-semibold" : "border-white/40"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        state === "fault" ? "bg-black" : "bg-white motion-safe-anim animate-pulse"
                      }`}
                    />
                    {state === "ok" ? "OPERATIONAL" : state === "fault" ? "FAULT" : "CHECKING"}
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  {state === "ok" && <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" strokeWidth={1.5} />}
                  {state === "fault" && <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" strokeWidth={1.5} />}
                  {state === "checking" && (
                    <LoaderCircle className="w-5 h-5 mt-0.5 shrink-0 animate-spin motion-safe-anim" strokeWidth={1.5} />
                  )}
                  <p className="text-sm leading-relaxed text-white/90">{report}</p>
                </div>
              </Frame>

              {/* Emails sent */}
              <Frame className="p-5">
                <span className="text-[11px] text-white/60 tracking-widest block mb-3">EMAILS SENT</span>
                <div className="text-6xl sm:text-7xl font-light tracking-tight tabular-nums drop-shadow-[0_0_24px_rgba(255,255,255,0.35)]">
                  {sent}
                </div>
                <div className="mt-5 pt-4 border-t border-white/15 flex justify-between text-xs text-white/70">
                  <span>
                    Last run <span className="text-white">{lastRun}</span>
                  </span>
                  <span>
                    Next run in <span className="text-white tabular-nums">{mounted ? left : "--:--"}</span>
                  </span>
                </div>
              </Frame>

              {/* Cycle progress */}
              <Frame className="px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <SegmentBar pct={mounted ? pct : 0} />
                  <span className="text-sm tabular-nums">{mounted ? Math.round(pct * 100) : 0}%</span>
                </div>
                <p className="text-[10px] text-white/50 tracking-widest mt-3">HOURLY CYCLE PROGRESS</p>
              </Frame>
            </div>

            {/* Map controls */}
            <div className="pointer-events-auto absolute right-0 bottom-0 flex flex-col gap-2">
              {[
                { i: Plus, f: () => changeZoom(0.15), l: "Zoom in" },
                { i: Minus, f: () => changeZoom(-0.15), l: "Zoom out" },
                { i: Maximize2, f: () => centerMap(1), l: "Recenter map" },
              ].map(({ i: Icon, f, l }) => (
                <button
                  key={l}
                  onClick={f}
                  aria-label={l}
                  className="w-10 h-10 flex items-center justify-center bg-black/90 border border-white/25 hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-white transition-colors"
                >
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                </button>
              ))}
            </div>

            {/* Map hint */}
            <div className="hidden sm:block absolute left-[380px] bottom-0 text-[10px] text-white/40 tracking-widest">
              DRAG TO MOVE MAP
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}