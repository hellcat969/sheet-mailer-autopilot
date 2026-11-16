// ===== Your 5 emails (softened wording to avoid spam filters). Edit anytime. =====
export const OFFSETS = [0, 3, 6, 10, 15]; // days after Email 1 was sent

const SIGN = "All the best,\nSarmad\nFounder, Spectres";
const PS = "P.S. If you’d rather not hear from me, reply “no” and I’ll stop.";

export function build(k, r) {
  const agency = r[0];
  const size = (r[4] || "").replace(/\s*-\s*/g, "-");
  const team = size ? `a team of ${size}` : "a small team";
  const hi = `Hi ${agency} team,`;
  const s1 = `found ${agency} on Clutch`;

  const mails = [
    { subject: s1, text: `${hi}

I know you’re busy, so I’ll keep this short.

I’m Sarmad, the founder of Spectres, a workspace that helps agencies email invoices, track payments and manage client projects and teams in one place. I found ${agency} on Clutch and noticed you’re ${team}, which is the kind of team I built it for.

Instead of switching between separate tools, you can manage your agency workflow in one place: spectres.pro

If now isn’t a good time, no problem. Whenever you have a moment, I’d be glad if you took a look and told me what you think.

${SIGN}

${PS}` },

    { subject: `Re: ${s1}`, text: `${hi}

Following up on my note from a few days ago.

I’m Sarmad, founder of Spectres. Agencies like ${agency} often keep tasks, client files and invoices in different tools, so we built Spectres to let your team assign tasks with deadlines, chat on each task and keep every file link in one place.

You can see how it works with your own team at spectres.pro

No pressure if the timing is off. If you do take a look, I’d value your honest view on how it fits your operations.

${SIGN}

${PS}` },

    { subject: "how many tools?", text: `${hi}

Quick one from me, Sarmad, founder of Spectres. A web development agency using it told us it replaced three separate subscriptions with one workspace, and I thought that might be relevant to a team like ${agency}.

If you have a new project kickoff coming up, it could be a good moment to try it: spectres.pro

If it’s not relevant, no worries. And if you do try it, I’d like to hear what you think.

${SIGN}

${PS}` },

    { subject: "new clients or current ones?", text: `${hi}

I’m Sarmad, founder of Spectres. Besides invoicing and projects, it includes an AI agent called Leads Scout, which finds local businesses that may need an agency’s services, with their name, phone and website.

It also helps you keep your current clients organized in the same workspace: spectres.pro

If that’s not a priority, that’s fine. If you try Leads Scout, I’d be curious how the results look for you.

${SIGN}

${PS}` },

    { subject: "who should I ask?", text: `${hi}

This is my last note, so I’ll keep it brief.

I’m Sarmad, founder of Spectres. I’m reaching out to agency owners who want invoices, tasks and client work in one place, and I may simply be writing to the wrong person at ${agency}.

If admin and client work land on your desk, or you’d like to pass this along to your team, you can find it at spectres.pro

Thanks for reading this far. If it’s not for you, I wish you all the best.

${SIGN}

${PS}` },
  ];
  return mails[k];
}