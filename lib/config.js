// ===== Your 5 emails (new structure + teams & projects). Edit anytime. =====
export const OFFSETS = [0, 3, 6, 10, 15]; // days after Email 1 was sent

const SIGN = "Best,\nSarmad Imran\nFounder, Spectres\nspectres.pro";
const PS = "P.S. If this isn’t relevant, just reply “no” and I won’t email again.";

export function build(k, r) {
  const agency = r[0];
  const size = (r[4] || "").replace(/\s*-\s*/g, "-");
  const team = size ? `a team of ${size}` : "a small team";

  const mails = [
    // EMAIL 1: intro
    { subject: `${agency}: 5 tabs, 3 spreadsheets, 1 lost invoice?`, text: `Hi ${agency} team, I know you’re busy, so I promise I won’t take much of your time.

I’m Sarmad Imran, Founder of Spectres.

Spectres is one workspace where agencies manage clients, teams, projects and invoices, built for ${team} like yours.
You can create projects, assign them to your team and track payments, all without juggling five different tools.

Sign up free at spectres.pro and start managing your agency from one place today.
It takes a couple of minutes, and your next invoice will thank you.

${SIGN}

${PS}` },

    // EMAIL 2: teams, projects, tasks
    { subject: `${agency}’s projects deserve better than 47 chat threads`, text: `Hi ${agency} team, I know your inbox is full, so I’ll keep this one short too.

I’m Sarmad Imran, Founder of Spectres, and I wrote to you a few days ago.

In Spectres you create a project in minutes, add your team and assign tasks with deadlines, all in a clean and professional way.
Everyone knows who is doing what and what’s urgent, without anyone asking “hey, did you see my message?”

Sign up free at spectres.pro and move one live project in to see how it feels.
You can start managing your team and your business from there today.

${SIGN}

${PS}` },

    // EMAIL 3: tool overload
    { subject: `Quick one: how many tools is ${agency} paying for?`, text: `Hi ${agency} team, I know you’re busy, so here’s the 30-second version.

I’m Sarmad Imran, Founder of Spectres.

Most agencies pay for separate tools for invoicing, project management and team tracking.
Spectres puts clients, teams, projects and invoices in one workspace, so you can cancel a few subscriptions and keep your sanity.

Sign up free at spectres.pro and see if it can replace a tool or two for ${agency}.
Start managing your business from one dashboard instead of five.

${SIGN}

${PS}` },

    // EMAIL 4: Leads Scout
    { subject: `Your next client is online right now, ${agency}`, text: `Hi ${agency} team, I know time is tight, so I’ll get straight to the point.

I’m Sarmad Imran, Founder of Spectres.

Besides managing teams, projects and invoices, Spectres has an AI agent called Leads Scout.
It finds local businesses that may need your services and gives you their name, phone number and website.

Sign up free at spectres.pro, try Leads Scout and see who it finds for ${agency}.
Then create a project for each new client and assign your team, all in the same workspace.

${SIGN}

${PS}` },

    // EMAIL 5: last email
    { subject: `Should I stop emailing you, ${agency}?`, text: `Hi ${agency} team, I know you’re busy, and this is my last email, I promise.

I’m Sarmad Imran, Founder of Spectres.

Spectres helps agency owners manage teams, projects, invoices and client work in one clean workspace.
If this isn’t your area, feel free to pass it to whoever handles admin and client work at ${agency}.

Sign up free at spectres.pro and start managing your business from there.
If it’s not for you, no hard feelings, and I wish ${agency} all the best.

${SIGN}

${PS}` },
  ];
  return mails[k];
}