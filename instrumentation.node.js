import cron from "node-cron";
import { runBatch } from "./lib/engine";

if (!process.env.VERCEL && !globalThis.__outreachCron) {
  globalThis.__outreachCron = cron.schedule("0 * * * *", () => runBatch()); // every hour
  setTimeout(() => runBatch({ force: true }), 8000); // also one run right after start
  console.log("Spectres outreach: automatic mode ON (5 emails per hour).");
}
