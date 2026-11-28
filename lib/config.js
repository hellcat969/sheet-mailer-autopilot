// ===== 3-step sequence: Email 1 (Day 1), Follow-up 1 (Day 3), Follow-up 2 (Day 7) =====
// OFFSETS = days after Email 1 was sent. The engine reads OFFSETS.length as the number of steps.
export const OFFSETS = [0, 3, 7];

// Words that are not a person's first name (used when guessing the name from the email)
const GENERIC = ["info", "hello", "contact", "office", "admin", "team", "support", "sales", "hi", "hey",
  "collaborate", "mail", "email", "enquiries", "inquiries", "general", "business", "partners", "work",
  "careers", "press", "billing", "accounts", "marketing", "projects", "studio", "agency", "web", "dev",
  "design", "newbusiness", "new", "talk", "connect", "welcome", "service", "services", "help", "bd"];

// The sheet has no first-name column, so the name is guessed from the email address.
// If it does not look like a first name, the greeting becomes "Hi there,".
function firstName(email, agency) {
  const [local, domain = ""] = email.toLowerCase().split("@");
  const brand = domain.split(".")[0];
  const squashed = agency.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!/^[a-z]{3,10}$/.test(local) || GENERIC.includes(local)) return "there";
  if (local === brand || squashed.includes(local) || brand.includes(local)) return "there";
  return local[0].toUpperCase() + local.slice(1);
}

export function build(k, r) {
  const agency = r[0];
  const hi = `Hi ${firstName(r[2], agency)},`;

  const mails = [
    // EMAIL 1 (Day 1)
    { subject: `Quick question about how ${agency} handles client work`, text: `${hi}

I'm Sarmad. I'm a freelance developer, and I built a small tool after struggling to keep track of which client tasks were urgent and which invoice was still unpaid.

I'm not trying to sell you anything yet. I just want to know if the problem is real for other people. How do you currently handle client requests, who's working on what, and knowing which hours got billed?

If it's already smooth, tell me, because that's useful to know too. If it's messy, I can walk you through what I built to solve this mess, you can just reply here.

Thanks,
Sarmad` },

    // FOLLOW-UP 1 (Day 3)
    { subject: `Still curious how ${agency} tracks billed hours`, text: `${hi}

Just a quick follow-up in case my last email got buried.

I'm still trying to learn how small agencies keep client requests, team tasks, and billable hours organized. Even a one-line answer helps, like "spreadsheet and chat" or "it's fine, we have a system."

If it's a mess for you too, I'm happy to show you what I built. If not, no worries at all.

Thanks,
Sarmad` },

    // FOLLOW-UP 2 (Day 7)
    { subject: "Last note from me", text: `${hi}

This is my last email, so I won't keep filling your inbox.

If tracking client work and unpaid invoices ever starts feeling messy at ${agency}, reply with a word and I'll send over what I built. If everything's running smoothly, that's great to hear, and I wish you a busy few months.

Thanks,
Sarmad` },
  ];
  return mails[k];
}