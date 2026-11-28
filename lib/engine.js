import { google } from "googleapis";
import nodemailer from "nodemailer";
import { OFFSETS, build } from "./config";
import { getState, setState } from "./store";

// Columns: A Name, B Website, C Email, D Type, E Size, then per step k (0-4):
// message col = F + 2k (send date), status col = G + 2k
const L = (n) => String.fromCharCode(65 + n);
// Any of these in ANY status cell = no more emails to that prospect
const STOP = ["replied", "dropped", "signed up", "signedup", "failed", "deaf", "bounced", "unsubscribed", "stop"];
const NET = ["ETIMEDOUT", "ECONNREFUSED", "ECONNRESET", "ESOCKET", "ECONNECTION", "ENOTFOUND", "EDNS", "EAUTH"];
const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function connect() {
  const id = process.env.SHEET_LINK?.match(/\/d\/([\w-]+)/)?.[1];
  if (!id) throw new Error("SHEET_LINK is missing or invalid in .env.local");
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });
  const tab = (await sheets.spreadsheets.get({ spreadsheetId: id })).data.sheets[0].properties.title;
  return { sheets, id, tab };
}

// Total emails successfully sent = number of filled "message date" cells
export async function getSentCount() {
  const c = globalThis.__cnt;
  if (c && Date.now() - c.t < 60000) return c.n;
  const { sheets, id, tab } = await connect();
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: id, range: `'${tab}'!F2:N` });
  let n = 0;
  for (const row of res.data.values || []) for (const j of [0, 2, 4, 6, 8]) if ((row[j] || "").trim()) n++;
  globalThis.__cnt = { n, t: Date.now() };
  return n;
}

// Sends mail either through the Gmail API (HTTPS, works when SMTP is blocked) or plain SMTP
function makeSender() {
  if (process.env.MAIL_MODE === "api") {
    const oauth = new google.auth.OAuth2(process.env.GMAIL_CLIENT_ID, process.env.GMAIL_CLIENT_SECRET);
    oauth.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
    const gmail = google.gmail({ version: "v1", auth: oauth });
    return async ({ from, to, subject, text }) => {
      const mime = [
        `From: ${from}`, `To: ${to}`,
        `Subject: =?UTF-8?B?${Buffer.from(subject).toString("base64")}?=`,
        "MIME-Version: 1.0", "Content-Type: text/plain; charset=UTF-8",
        "Content-Transfer-Encoding: base64", "",
        Buffer.from(text).toString("base64"),
      ].join("\r\n");
      await gmail.users.messages.send({ userId: "me", requestBody: { raw: Buffer.from(mime).toString("base64url") } });
    };
  }
  const port = Number(process.env.SMTP_PORT) || 587;
  const m = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com", port, secure: port === 465, requireTLS: port !== 465,
    family: 4, connectionTimeout: 20000, greetingTimeout: 20000, socketTimeout: 30000,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return (o) => m.sendMail(o);
}

async function work() {
  const { sheets, id, tab } = await connect();
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: id, range: `'${tab}'!A2:O` });
  const now = Date.now();
  const today = new Date().toISOString().slice(0, 10);
  const steps = OFFSETS.length; // 3: Email 1, Follow-up 1, Follow-up 2
  const dailyLimit = Number(process.env.DAILY_LIMIT) || 10;
  const due = [];
  let sentToday = 0;

  (res.data.values || []).forEach((raw, i) => {
    const r = Array.from({ length: 15 }, (_, j) => (raw[j] || "").trim());
    for (let k = 0; k < 5; k++) if (r[5 + 2 * k].slice(0, 10) === today) sentToday++; // counts every email sent today
    if (!isEmail(r[2])) return;
    const st = [0, 1, 2, 3, 4].map((k) => r[6 + 2 * k].toLowerCase());
    if (st.some((s) => STOP.includes(s))) return; // Replied / Dropped / etc. = sequence stops
    const k = st.slice(0, steps).findIndex((s) => s !== "sent");
    if (k === -1) return; // all steps already sent
    if (k > 0) {
      const first = Date.parse(r[5]);
      const prev = Date.parse(r[5 + 2 * (k - 1)]);
      if (isNaN(first) || isNaN(prev)) return;
      // due on its day (counted from Email 1), and at least 2 days after the previous email
      if (now < first + OFFSETS[k] * 864e5 || now < prev + 2 * 864e5) return;
    }
    due.push({ row: i + 2, k, r });
  });

  const remaining = dailyLimit - sentToday;
  if (remaining <= 0) return ""; // daily limit reached, wait for tomorrow
  due.sort((a, b) => b.k - a.k); // follow-ups first (time-sensitive), then new prospects
  const batch = due.slice(0, Math.min(Number(process.env.PER_RUN) || 1, remaining));
  if (!batch.length) return "";

  const send = makeSender();

  let warn = "";
  for (const d of batch) {
    const { subject, text } = build(d.k, d.r);
    let status = "Sent";
    try {
      await send({ from: `${process.env.FROM_NAME || "Sarmad"} <${process.env.SMTP_USER}>`, to: d.r[2], subject, text });
    } catch (e) {
      // Connection / login problems are NOT the prospect's fault: stop, leave rows Pending, show the error.
      const api = process.env.MAIL_MODE === "api";
      if (NET.includes(e.code) || [401, 403, 429].includes(Number(e.code)) || /timeout|invalid_grant|unauthorized_client/i.test(e.message))
        throw new Error(api ? `Gmail API error: ${e.message}`
          : e.code === "EAUTH" ? "Gmail rejected the login. Check SMTP_USER and SMTP_PASS (app password)."
          : `Cannot reach mail server (${e.code || e.message}). Check SMTP port or network.`);
      status = "Failed"; warn = `Address rejected: ${d.r[2]}`;
    }
    await sheets.spreadsheets.values.update({
      spreadsheetId: id, valueInputOption: "RAW",
      range: `'${tab}'!${L(5 + 2 * d.k)}${d.row}:${L(6 + 2 * d.k)}${d.row}`,
      requestBody: { values: [[status === "Sent" ? new Date().toISOString().slice(0, 10) : "", status]] },
    });
    globalThis.__cnt = null;
    await sleep(Number(process.env.SEND_DELAY_MS ?? 15000));
  }
  return warn;
}

export async function runBatch({ force = false } = {}) {
  if (globalThis.__busy) return;
  const prev = await getState();
  if (!force && prev.lastRunMs && Date.now() - prev.lastRunMs < 50 * 60 * 1000) return;
  globalThis.__busy = true;
  await setState({ lastRunMs: Date.now(), lastRun: new Date().toISOString() });
  try { await setState({ ok: true, error: await work() }); }
  catch (e) { await setState({ ok: false, error: e.message }); console.error(e.message); }
  finally { globalThis.__busy = false; }
}