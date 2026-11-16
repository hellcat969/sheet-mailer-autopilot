# sheet-drip

**Self-hosted cold email automation powered by a Google Sheet.**
Add your prospects to a sheet, write your 5-step email sequence once, and let the app send and follow up on its own, every hour, 24/7, for free.

Includes a live black-and-white "command unit" dashboard that shows only what matters: **is the system running, is there an error, and how many emails were delivered.**

---

## Why this exists

Cold outreach is one of the best ways for freelancers and small businesses to find clients. It is also tedious. You copy names into a mailer, remember who to follow up with, and lose track of who replied. Paid tools solve this, but they charge monthly per seat and are built for big sales teams.

`sheet-drip` keeps it simple:

- **Your spreadsheet is the database.** No new tool to learn. Add a row, and that prospect enters the sequence.
- **It follows up for you.** Five emails on a schedule (Day 1, 3, 6, 10, 15), written by you.
- **It stops when it should.** Mark a prospect as `Replied` or `Signed up` and they get nothing more.
- **It sends slowly and safely.** 5 emails per hour from your own Gmail, so it looks like a person, not a blast.
- **It costs nothing to run.** Google Sheets, the Gmail API, Vercel's free plan and GitHub Actions are all free at this volume.

### Who it helps

**Freelancers** (developers, designers, writers, marketers): build a list of 30 to 100 target agencies or businesses, write one good sequence, and let it run in the background while you do client work. No more "I should follow up" guilt.

**Small business owners and agencies:** reach new customers, partners or resellers without hiring an SDR or paying for a sales platform. Your whole pipeline lives in one sheet that your team can already open.

**Anyone testing a market:** want to know if a niche cares about your offer? Send 5 emails an hour for a week and read the replies.

---

## How it works

```
Google Sheet  ->  hourly trigger  ->  picks the next 5 due emails  ->  sends via Gmail
      ^                                                                      |
      +---- writes the send date + status (Sent / Failed / Deaf) <-----------+
```

- Follow-ups are due 3, 6, 10 and 15 days after Email 1 and are sent before new prospects.
- Each prospect's name and team size are filled into the email automatically.
- If connecting or logging in fails, nothing is marked as failed. The rows stay `Pending`, and the dashboard shows the error.
- If a prospect has not replied 2 days after Email 5, the status becomes `Deaf` and they are never emailed again.

### Status values

| Status | Meaning | Set by |
|---|---|---|
| Pending / blank | Not sent yet for this step | You |
| Sent | Email delivered to Gmail | App |
| Failed | The address was rejected | App |
| Replied | They answered, so stop | **You** |
| Signed up | Converted, so stop | **You** |
| Deaf | No update 2 days after Email 5 | App |

> The app does **not** read your inbox. When someone replies, set `Replied` in the sheet yourself, or the next follow-up will still go out.

### Sheet layout (first sheet tab, header in row 1)

| A | B | C | D | E | F | G | H | I | ... | N | O |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Name | Website | Email | Agency type | Individuals | 1st Message | Status | 2nd Message | Status | ... | 5th Message | Status |

Message columns hold the send date (written by the app). Add a dropdown to the Status columns with: `Pending, Sent, Failed, Replied, Signed up, Deaf`.

---

## Setup (about 30 minutes, one time)

### 1. Install
```bash
git clone https://github.com/YOUR_USER/sheet-drip.git
cd sheet-drip
npm install
cp .env.example .env.local
```

### 2. Google Sheets access (service account)
1. In [Google Cloud Console](https://console.cloud.google.com), create a project and enable the **Google Sheets API**.
2. Create a **Service Account**, then add a **JSON key** to it.
3. Put its `client_email` and `private_key` into `GOOGLE_CLIENT_EMAIL` and `GOOGLE_PRIVATE_KEY` in `.env.local`.
4. Share your sheet with the service-account email as **Editor**.
5. Paste your sheet link into `SHEET_LINK`.

### 3. Sending email

**Option A: Gmail API (recommended, works on any network and on Vercel)**
1. In the same Google project, enable the **Gmail API**.
2. Open *Google Auth Platform*: set the audience to **External**, fill in the Branding page, add the scope `https://www.googleapis.com/auth/gmail.send`, and **publish the app to production**. (In *Testing* mode the refresh token expires after 7 days.)
3. Create an **OAuth client ID** (Web application) with the redirect URI `https://developers.google.com/oauthplayground`.
4. Open the [OAuth Playground](https://developers.google.com/oauthplayground), tick *Use your own OAuth credentials*, authorize the `gmail.send` scope while signed in as your sending account, and exchange the code for a **refresh token**. Google will warn that the app is unverified. That is expected for your own app.
5. In `.env.local`:
```
MAIL_MODE=api
GMAIL_CLIENT_ID=...
GMAIL_CLIENT_SECRET=...
GMAIL_REFRESH_TOKEN=...
SMTP_USER=you@gmail.com
FROM_NAME=Your Name
```

**Option B: SMTP** (some networks block SMTP ports)
Leave `MAIL_MODE` unset and fill in `SMTP_HOST`, `SMTP_PORT=587`, `SMTP_USER` and `SMTP_PASS` (a Gmail app password).

### 4. Write your emails
Edit **`lib/config.js`**. It holds the 5 emails, the subjects and the follow-up timing (`OFFSETS`). Placeholders available: the agency name (`r[0]`) and team size (`r[4]`).

### 5. Run it locally
```bash
npm run build
npm start
```
Open http://localhost:3000. The first cycle starts about 8 seconds after launch, then every hour on the hour. Keep the terminal open.

---

## Deploy for free (Vercel + GitHub Actions)

Vercel's free plan only allows cron jobs once a day, so a free GitHub Actions job triggers the hourly run.

1. Push this repo to GitHub, then import it in [Vercel](https://vercel.com).
2. Add every variable from `.env.local` to Vercel's **Environment Variables**. Also set `SEND_DELAY_MS=4000` and `CRON_SECRET=` (a long random string).
3. Turn off Vercel *Deployment Protection* for the production domain.
4. In GitHub, add repository secrets `APP_URL` (for example `https://your-app.vercel.app`) and `CRON_SECRET` (same value as in Vercel).
5. The included workflow `.github/workflows/outreach.yml` calls `/api/cron` every hour. Test it from the **Actions** tab with *Run workflow*.

On Vercel the in-app scheduler is skipped automatically (`instrumentation.node.js` checks `process.env.VERCEL`), and the dashboard's "last run" time may be blank. The delivered count is always read from your sheet.

`.github/workflows/outreach.yml`:
```yaml
name: hourly-outreach
on:
  schedule:
    - cron: "0 * * * *"
  workflow_dispatch:
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - run: >
          curl -fsS --max-time 280
          -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
          "${{ secrets.APP_URL }}/api/cron"
```

---

## Environment variables

| Variable | Purpose |
|---|---|
| `APP_PASSWORD` | Secret for manually triggering `/api/cron?key=...` |
| `CRON_SECRET` | Bearer token for the hourly trigger |
| `SHEET_LINK` | Link to your Google Sheet |
| `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY` | Service account for Sheets |
| `MAIL_MODE` | `api` for the Gmail API, otherwise SMTP |
| `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN` | Gmail API login |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | SMTP login (`SMTP_USER` is also the From address) |
| `FROM_NAME` | Sender name |
| `PER_RUN` | Emails per cycle (default 5) |
| `SEND_DELAY_MS` | Pause between emails (default 15000) |

---

## Use it responsibly

Cold email is regulated (for example CAN-SPAM in the US and GDPR in the EU). You are responsible for how you use this tool:

- Only email people you have a legitimate reason to contact, and write honest subject lines.
- Make it easy to opt out. The sample emails end with a "reply no and I'll stop" line. When someone says no, mark them as `Replied` or `Stop` in the sheet.
- Keep volume low and relevant. Sending irrelevant bulk mail can get your Gmail account restricted.
- Set up SPF, DKIM and DMARC if you send from your own domain.

This software is provided as is, with no warranty. See the license below.

## Limitations

- Replies are not detected automatically.
- Plain-text emails only.
- The sheet's first tab is used, with the column layout above.
- Gmail has daily sending limits. The default of 5 per hour is far below them.

---

## About the author

Built by **Sarmad**, founder of [Spectres](https://spectres.pro), a workspace for freelancers and small agencies to send invoices, track payments, manage client projects and find new leads in one place. I built `sheet-drip` to run my own outreach for Spectres, and I'm sharing it so other freelancers and business owners can reach new customers without paying for yet another subscription.

If it helps you, a star on the repo is appreciated. Issues and pull requests are welcome.

## License

MIT. Add a `LICENSE` file with the MIT text and your name.
