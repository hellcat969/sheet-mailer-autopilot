// ===== Your 5 emails. Edit the wording here anytime. =====
// Placeholders: ${agency} = Name column, ${team} = Individuals column
export const OFFSETS = [0, 3, 6, 10, 15]; // days after Email 1 was sent

const BUSY = "I know you’re incredibly busy and probably get a lot of messages";
const PS = "P.S. If you’d rather not hear from me, reply “no” and I’ll stop.";
const SIGN = "All the best,\nSarmad\nFounder, Spectres | spectres.pro";
const OK = "I totally understand if you’re too busy right now.";

export function build(k, r) {
  const agency = r[0];
  const size = (r[4] || "").replace(/\s*-\s*/g, "-");
  const team = size ? `a team of ${size}` : "a small team";
  const hi = `Hi ${agency},`;
  const s1 = `quick question for ${agency}`;

  const mails = [
    { subject: s1, text: `${hi}

${BUSY}, so this will only take 60 seconds to read.

I’m Sarmad, the founder of Spectres, a workspace that helps agencies email invoices, track payments and manage client projects teams and more in one place. I found ${agency} on Clutch and noticed you are ${team}, which is exactly the kind of team I built it for.

Instead of juggling fragmented tabs, you can jump right in and start managing your agency workflow here: spectres.pro.

${OK} Take a look and give it a spin whenever you have a moment. It will completely make my day.

All the best,
Sarmad
Founder, Spectres

${PS}` },

    { subject: `Re: ${s1}`, text: `${hi}

${BUSY}, so I’ll keep this under 60 seconds.

I’m Sarmad, founder of Spectres, and I’m following up because agencies like ${agency} often juggle tasks, client files and invoices across different tools. We built Spectres so your team can assign tasks with deadlines, chat on each task and keep every file link in one place.

You can set up your workspace and start using it with your team today at spectres.pro.

${OK} Check it out and see how it fits your operations. It will completely make my day.

${SIGN}

${PS}` },

    { subject: "how many tools?", text: `${hi}

${BUSY}, so this will only take 60 seconds to read.

I’m Sarmad, founder of Spectres. A web development agency using it told us it replaced three separate subscriptions with one workspace, and I thought that might be relevant to a team like ${agency}.

Why not consolidate your stack and start using it for your next project kickoff? Head over to spectres.pro to get started.

${OK} Take it for a test drive and let me know what you think. It will completely make my day.

${SIGN}

${PS}` },

    { subject: "new clients or current ones?", text: `${hi}

${BUSY}, so this will only take 60 seconds to read.

I’m Sarmad, founder of Spectres. Besides invoicing and projects, it includes an AI agent called Leads Scout that finds local businesses that may need an agency’s services, with their name, phone and website.

You can start finding new clients and organizing your current ones right now by opening your workspace at spectres.pro.

${OK} Jump in and try out the AI lead scout yourself. It will completely make my day.

${SIGN}

${PS}` },

    { subject: "who should I ask?", text: `${hi}

${BUSY}, so this is my last note and it’ll take 30 seconds.

I’m Sarmad, founder of Spectres. I’m reaching out to agency owners who want invoices, tasks and client work in one place, and I may simply be writing to the wrong person at ${agency}.

If admin and client work land on your desk or if you want to pass this along to your team. You can jump right in and start using it at spectres.pro.

${OK} Thanks for reading this far, and I hope you check it out. It will completely make my day.

${SIGN}

${PS}` },
  ];
  return mails[k];
}