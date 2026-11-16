"use client";
import { useEffect, useState } from "react";

const css = `
.w{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;
 background:repeating-linear-gradient(0deg,#000 0 3px,#0a0a0a 3px 4px)}
.p{width:100%;max-width:640px;border:2px solid #fff;padding:28px;position:relative;background:#000}
.p:before,.p:after{content:"";position:absolute;width:18px;height:18px;border:3px solid #fff}
.p:before{top:-6px;left:-6px;border-right:0;border-bottom:0}.p:after{bottom:-6px;right:-6px;border-left:0;border-top:0}
h1{font-size:14px;letter-spacing:6px;margin:0 0 4px}.sub{font-size:11px;color:#888;letter-spacing:3px;margin-bottom:22px}
.tank{display:block;margin:0 auto 18px;width:200px}
.st{border:1px solid #fff;padding:16px;text-align:center;font-size:20px;letter-spacing:4px;margin-bottom:16px}
.st.ok span{animation:b 1.2s infinite}.st.bad{background:#fff;color:#000;font-weight:bold}
.err{font-size:12px;margin-top:10px;letter-spacing:1px;word-break:break-word}
.cnt{border:1px solid #fff;padding:16px;text-align:center}.cnt b{display:block;font-size:64px;line-height:1.1}
.cnt i{font-style:normal;font-size:11px;letter-spacing:4px;color:#aaa}
.bar{height:6px;border:1px solid #fff;margin:18px 0 10px;overflow:hidden}.bar div{height:100%;width:30%;background:#fff;animation:s 2s linear infinite}
.bad~.bar div{animation:none;width:0}
.ft{display:flex;justify-content:space-between;font-size:11px;color:#aaa;letter-spacing:2px}
@keyframes b{50%{opacity:.2}}@keyframes s{0%{margin-left:-30%}100%{margin-left:100%}}
@keyframes r{0%{transform:translateX(0)}50%{transform:translateX(1.5px)}100%{transform:translateX(0)}}
.tank g.t{animation:r .4s infinite}`;

export default function Home() {
  const [d, setD] = useState(null);
  const [left, setLeft] = useState("--:--");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const load = () => fetch("/api/status").then((r) => r.json()).then(setD).catch(() => setD({ ok: false, error: "Cannot reach the app server.", sent: null }));
    load(); const a = setInterval(load, 10000);
    
    const updateCountdown = () => {
      const n = new Date(); const next = new Date(n); next.setHours(n.getHours() + 1, 0, 0, 0);
      const s = Math.floor((next - n) / 1000);
      setLeft(`${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`);
    };
    
    updateCountdown();
    const t = setInterval(updateCountdown, 1000);
    return () => { clearInterval(a); clearInterval(t); };
  }, []);

  const ok = !d || d.ok;

  return (
    <div className="w">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="p">
        <h1>SPECTRES // OUTREACH</h1>
        <div className="sub">AUTOMATED COMMAND UNIT</div>
        <svg className="tank" viewBox="0 0 200 90" fill="none" stroke="#fff" strokeWidth="2">
          <g className="t">
            <rect x="14" y="56" width="172" height="22" rx="11"/>
            {[36,62,88,114,140,164].map((x) => <circle key={x} cx={x} cy="67" r="5"/>)}
            <path d="M34 56 L46 36 H146 L164 56 Z"/><rect x="72" y="18" width="58" height="18"/>
            <line x1="130" y1="27" x2="196" y2="22" strokeWidth="5"/><line x1="86" y1="18" x2="86" y2="8"/>
          </g>
        </svg>
        <div className={"st " + (ok ? "ok" : "bad")}>
          {ok ? <><span>●</span> SYSTEM OPERATIONAL</> : "▲ SYSTEM FAULT"}
          {d?.error && <div className="err">{ok ? "NOTE: " : "ERROR: "}{d.error}</div>}
        </div>
        <div className="bar"><div /></div>
        <div className="cnt"><b>{d?.sent ?? "--"}</b><i>EMAILS DELIVERED</i></div>
        <div className="ft" style={{ marginTop: 14 }}>
          <span>NEXT CYCLE {mounted ? left : "--:--"}</span>
          <span>LAST {d?.lastRun ? new Date(d.lastRun).toLocaleTimeString() : "--"}</span>
        </div>
      </div>
    </div>
  );
}