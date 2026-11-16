// ===== Your 5 emails (reworded for better inbox placement). Edit anytime. =====
export const OFFSETS = [0, 3, 6, 10, 15]; // days after Email 1 was sent

const SIGN = "Best,\nSarmad\nFounder, Spectres";
const PS = "P.S. If this isn’t relevant, just reply “no” and I won’t email again.";

export function build(k, r) {
  const agency = r[0];
  const size = (r[4] || "").replace(/\s*-\s*/g, "-");
  const team = size ? `a team of ${size}` : "a small team";
  const hi = `Hi ${agency} team,`;

  const mails = [
    { subject: `Quick question about how ${agency} tracks clients`, text: `${hi}

I’m Sarmad, the founder of Spectres. I came across ${agency} on Clutch and saw that you’re ${team}.

I built Spectres for agencies of that size. It lets you send invoices, track payments and manage client projects and teams in one workspace, so you don’t need to juggle separate tools.

How does ${agency} handle this today? If you’re curious, the details are at spectres.pro and I’d value your thoughts.

${SIGN}

${PS}` },

    { subject: `Tasks and invoices at ${agency}`, text: `${hi}

I wrote a few days ago about Spectres, so I’ll add a bit more detail.

Many agencies keep tasks, client files and invoices in different places. In Spectres, your team can assign tasks with deadlines, chat on each task and keep every file link in one place.

You can look around at spectres.pro. If you do, I’d like to hear how it fits the way ${agency} works.

${SIGN}

${PS}` },

    { subject: `How many tools does ${agency} use?`, text: `${hi}

A web development agency recently told us Spectres replaced three separate subscriptions with a single workspace. I thought that might be relevant to ${agency}.

If you have a new project starting soon, it could be a good time to try it: spectres.pro

If the timing is wrong, that’s fine. If you do try it, I’d appreciate your feedback.

${SIGN}

${PS}` },

    { subject: `Finding new clients for ${agency}`, text: `${hi}

Besides invoicing and project management, Spectres includes an AI agent called Leads Scout. It finds local businesses that may need an agency’s services and gives you their name, phone number and website.

Your current clients stay organized in the same workspace: spectres.pro

If you try Leads Scout, I’d be curious how the results look for ${agency}.

${SIGN}

${PS}` },

    { subject: `Right person at ${agency}?`, text: `${hi}

This is my last email on this topic.

I’m reaching out to agency owners who want invoices, tasks and client work in one place, and I may have written to the wrong person at ${agency}.

If admin and client work sit with you, or with someone else on your team, you can find Spectres at spectres.pro

Thanks for reading, and I wish you all the best.

${SIGN}

${PS}` },
  ];
  return mails[k];
}