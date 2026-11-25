// ===== Single email (first email only). Edit the wording here anytime. =====
// Keep FOLLOWUPS off in Vercel (the default): only Email 1 exists in this file.
export const OFFSETS = [0];

const SIGN = "Best,\nSarmad Imran\nFounder, Spectres";
const PS = "P.S. If this isn’t relevant, just reply “no” and I won’t email again.";

export function build(k, r) {
  if (k !== 0) throw new Error("Only Email 1 is defined in lib/config.js. Keep FOLLOWUPS off.");

  const agency = r[0];
  const size = (r[4] || "").replace(/\s*-\s*/g, "-");
  const teams = size ? `teams of ${size}` : "small teams";

  return {
    subject: `one workspace for ${agency}`,
    text: `Hi ${agency} team,

I know you’re busy, so I’ll keep this short.

I’m Sarmad Imran, founder of Spectres. It’s one workspace where agencies manage clients, teams, projects and invoices, built for ${teams} like yours.

You can create a project, assign tasks to your team with deadlines, and see which invoices are sent, paid or overdue, without switching between five different tools.

If that sounds useful, you can take a look at spectres.pro. Setting up takes a couple of minutes.

${SIGN}

${PS}`,
  };
}