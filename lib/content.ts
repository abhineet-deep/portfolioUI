// All copy, dates and links for the site live here. Components render from this file only.
// Anything marked TODO is something I don't know yet — fill it in before shipping.

export type Accent = "teal" | "iris" | "amber" | "coral";

/** Month is 1-12. */
export type YearMonth = { year: number; month: number };

export const site = {
  name: "Abhineet Deep",
  monogram: "ad",
  role: "Backend engineer in Bengaluru",
  title: "Abhineet Deep — Backend engineer",
  description:
    "Node.js and AWS, four years building services for payments and banking. Now growing into full-stack and building with LLMs on the side.",
  summary:
    "Node.js and AWS, four years building services for payments and banking. Now growing into full-stack and building with LLMs on the side.",
  email: "abhineetdeepbksc@gmail.com",
  github: "https://github.com/abhineet-deep",
  linkedin: "https://linkedin.com/in/abhineetdeep",
  // TODO: add the deployed Vercel URL so OG tags resolve absolute image/url paths.
  url: "https://example.com",
} as const;

export const nav = {
  links: [
    { id: "projects", label: "Projects" },
    { id: "experience", label: "Experience" },
    { id: "contact", label: "Contact" },
  ],
} as const;

export const hero = {
  primaryCta: "See my projects",
  traceCaption: "My career as a request trace. Hover or tab through a span to read it.",
  tracePath: "/engineers/abhineet-deep",
  traceMethod: "GET",
  traceStatus: "200 OK",
  /** Used for the first render only; the client swaps in the real current month after mount. */
  fallbackNow: { year: 2026, month: 11 } satisfies YearMonth,
  paletteCta: "Command palette",
  /** Start of the trace axis. */
  axisStart: { year: 2018, month: 7 } satisfies YearMonth,
} as const;

export type TraceSpan = {
  id: string;
  label: string;
  /** Indented under the root span. */
  child: boolean;
  start: YearMonth;
  /** null = still running, drawn up to the current month. */
  end: YearMonth | null;
  accent: Accent;
  /** Dim the bar (used for the degree span). */
  dim?: boolean;
  /** True while a start/end date is a TODO guess: the bar is drawn but its duration is not shown. */
  placeholder?: boolean;
  /** Period text shown in the detail panel. */
  period: string;
  detail: string;
};

export const traceSpans: TraceSpan[] = [
  {
    id: "root",
    label: "abhineet-deep · career",
    child: false,
    start: { year: 2018, month: 8 },
    end: null,
    accent: "iris",
    period: "Aug 2018 – now",
    detail: "Computer science degree, then backend engineering in payments and banking, and now LLM side projects.",
  },
  {
    id: "btech",
    label: "b.tech, computer science",
    child: true,
    start: { year: 2018, month: 8 },
    end: { year: 2022, month: 6 },
    accent: "iris",
    dim: true,
    period: "Aug 2018 – Jun 2022",
    detail: "Heritage Institute of Technology, Kolkata.",
  },
  {
    id: "certs",
    label: "aws × 2 + node.js certified",
    placeholder: true,
    child: true,
    // The brief only gives "2022" for the certifications.
    // TODO: confirm the exact month for each certification.
    start: { year: 2022, month: 1 },
    end: { year: 2022, month: 12 },
    accent: "amber",
    period: "2022",
    detail: "AWS Certified Developer – Associate, AWS Certified Solutions Architect – Associate and Certified Node.js Developer (Edureka).",
  },
  {
    id: "tcs",
    label: "tcs · payments & banking",
    placeholder: true,
    child: true,
    start: { year: 2022, month: 7 },
    // TODO: confirm the month I left TCS and joined Virtusa.
    end: { year: 2025, month: 1 },
    accent: "teal",
    period: "Jul 2022 – TODO",
    detail: "Tata Consultancy Services. TODO: add what I built here (no metrics unless they are real).",
  },
  {
    id: "virtusa",
    label: "virtusa · backend engineer",
    placeholder: true,
    child: true,
    // TODO: confirm the month I joined Virtusa.
    start: { year: 2025, month: 1 },
    end: null,
    accent: "teal",
    period: "TODO – now",
    detail: "Virtusa. TODO: add what I'm working on here.",
  },
  {
    id: "flowsmith",
    label: "flowsmith · founder",
    placeholder: true,
    child: true,
    // TODO: confirm when Flowsmith started.
    start: { year: 2025, month: 6 },
    end: null,
    accent: "coral",
    period: "TODO – now",
    detail: "My AI automation company. We build automations for clients.",
  },
  {
    id: "llm-gateway",
    label: "llm-gateway",
    placeholder: true,
    child: true,
    // TODO: confirm when this project started.
    start: { year: 2025, month: 9 },
    end: null,
    accent: "coral",
    period: "TODO – now",
    detail: "A Node.js service on AWS that sits between apps and multiple model providers behind one API.",
  },
  {
    id: "statement-analyzer",
    label: "statement-analyzer",
    placeholder: true,
    child: true,
    // TODO: confirm when this project started.
    start: { year: 2025, month: 10 },
    end: null,
    accent: "coral",
    period: "TODO – now",
    detail: "Upload a bank or UPI statement PDF; an LLM categorizes each transaction and a dashboard shows monthly spending.",
  },
];

export type Project = {
  id: "llm-gateway" | "statement-analyzer" | "flowsmith" | "payments";
  title: string;
  status: string;
  description: string;
  tags: string[];
  accent: Accent;
  /** TODO: add repo / live URLs when I have them. */
  href?: string;
};

export const projectsSection = {
  id: "projects",
  heading: "Things I've built",
  intro: "Side projects and the day-job work behind them.",
};

export const projects: Record<Project["id"], Project> = {
  "llm-gateway": {
    id: "llm-gateway",
    title: "LLM gateway",
    status: "In progress",
    description:
      "A Node.js service on AWS that sits between apps and multiple model providers behind one API.",
    tags: ["Node.js", "TypeScript", "AWS"],
    accent: "coral",
  },
  "statement-analyzer": {
    id: "statement-analyzer",
    title: "Statement analyzer",
    status: "In progress",
    description:
      "Upload a bank or UPI statement PDF; an LLM categorizes each transaction and a dashboard shows monthly spending.",
    tags: ["LLM", "PDF", "Dashboard"],
    accent: "coral",
  },
  flowsmith: {
    id: "flowsmith",
    title: "Flowsmith",
    status: "Founder",
    description: "My AI automation company. We build automations for clients.",
    tags: ["AI", "Automation"],
    accent: "coral",
  },
  payments: {
    id: "payments",
    title: "Payments and banking backends",
    status: "Day job",
    // TODO: add specifics (services, scale) only if they are real and shareable.
    description:
      "Four years building Node.js and AWS services for payments and banking at Tata Consultancy Services and Virtusa.",
    tags: [],
    accent: "teal",
  },
};

export const flowsmithSteps = ["New lead", "AI drafts reply", "Saved to CRM"] as const;
export const gatewayDiagram = { source: "your app", hub: "gateway", targets: ["model A", "model B", "model C"] } as const;
// Illustrative bars only — not real spending data.
export const analyzerBars = [42, 58, 36, 72, 50, 64, 46] as const;

export const stack: string[] = [
  "Node.js", "TypeScript", "Express", "React", "AWS Lambda", "API Gateway", "DynamoDB", "SQS",
  "SNS", "EventBridge", "IAM", "CDK", "EC2", "MongoDB", "MySQL", "PostgreSQL", "Redis", "Kafka",
  "Docker", "Jest", "Mocha", "GraphQL", "Swagger/OpenAPI",
];

export const marqueeAccents: Accent[] = ["teal", "iris", "amber", "coral"];

export type Job = {
  period: string;
  org: string;
  role: string;
  description: string;
};

export const experience = {
  id: "experience",
  heading: "Where I've worked",
  jobs: [
    {
      period: "Jul 2022 – TODO",
      org: "Tata Consultancy Services",
      role: "TODO: exact job title",
      description: "TODO: what I built here — services, stack, responsibilities.",
    },
    {
      period: "TODO – now",
      org: "Virtusa",
      role: "Backend engineer",
      description: "TODO: what I'm working on — services, stack, responsibilities.",
    },
  ] satisfies Job[],
  certsHeading: "Certifications",
  certs: [
    { name: "AWS Certified Developer – Associate", year: "2022" },
    { name: "AWS Certified Solutions Architect – Associate", year: "2022" },
    { name: "Certified Node.js Developer, Edureka", year: "2022" },
  ],
};

export const contact = {
  id: "contact",
  heading: "Hiring a backend engineer? Let's talk.",
  line: "Open to backend and full-stack roles.",
  emailCta: "Email me",
  copyCta: "Copy email",
  copied: "Email copied",
};

export const footer = "Built with Next.js, Tailwind and Framer Motion. Press ⌘K to get around.";

export const palette = {
  empty: 'No matching command. Try "projects" or "email".',
  placeholder: "Type a command or search",
};
