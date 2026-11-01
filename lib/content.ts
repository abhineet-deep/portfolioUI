// All copy, dates and links for the site live here. Components render from this file only.
// Fields I don't know yet are left out (see the TODO comments). Components skip missing fields, and
// scripts/check-content.mjs fails the build if the word TODO ever appears inside a string here.

export type Accent = "teal" | "iris" | "amber" | "coral";

/** Month is 1-12. */
export type YearMonth = { year: number; month: number };

export const site = {
  name: "Abhineet Deep",
  monogram: "ad",
  role: "Backend engineer in Bengaluru",
  location: "Bengaluru",
  title: "Abhineet Deep — Backend engineer",
  description:
    "Node.js and AWS, four years building services for payments and banking. Now growing into full-stack and building with LLMs on the side.",
  summary:
    "Node.js and AWS, four years building services for payments and banking. Now growing into full-stack and building with LLMs on the side.",
  email: "abhineetdeepbksc@gmail.com",
  github: "https://github.com/abhineet-deep",
  linkedin: "https://linkedin.com/in/abhineetdeep",
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
  /** Start of the trace axis: the first job. */
  axisStart: { year: 2022, month: 7 } satisfies YearMonth,
  beforeTrace: "Before this trace: B.Tech in computer science, Heritage Institute of Technology, Kolkata (2018–2022).",
} as const;

export type TraceSpan = {
  id: string;
  label: string;
  /** Indented under the root span. */
  child: boolean;
  /** A span is only drawn when it has a start and an end ("now" counts as an end). */
  start?: YearMonth;
  end?: YearMonth | "now";
  accent: Accent;
  /** Set when only the year is known: the bar is drawn but no duration is shown. */
  yearOnly?: boolean;
  /** Text shown in the detail panel; derived from the dates when omitted. */
  period?: string;
  detail?: string;
};

export const traceSpans: TraceSpan[] = [
  {
    id: "root",
    label: "abhineet-deep · career",
    child: false,
    start: { year: 2022, month: 7 },
    end: "now",
    accent: "iris",
    detail: "Backend engineering in payments and banking, and now LLM side projects.",
  },
  {
    id: "certs",
    label: "aws × 2 + node.js certified",
    child: true,
    // Only the year (2022) is known. TODO: add the month of each certification.
    start: { year: 2022, month: 1 },
    end: { year: 2022, month: 12 },
    yearOnly: true,
    accent: "amber",
    period: "2022",
    detail: "AWS Certified Developer – Associate, AWS Certified Solutions Architect – Associate and Certified Node.js Developer (Edureka).",
  },
  {
    id: "tcs",
    label: "tcs · payments & banking",
    child: true,
    start: { year: 2022, month: 7 },
    // TODO: end month at TCS (hidden until set).
    accent: "teal",
    detail: "Tata Consultancy Services.",
  },
  {
    id: "virtusa",
    label: "virtusa · backend engineer",
    child: true,
    // TODO: start month at Virtusa (hidden until set).
    end: "now",
    accent: "teal",
    detail: "Virtusa.",
  },
  {
    id: "flowsmith",
    label: "flowsmith · founder",
    child: true,
    // TODO: start month for Flowsmith (hidden until set).
    end: "now",
    accent: "coral",
    detail: "My AI automation company. We build automations for clients.",
  },
  {
    id: "llm-gateway",
    label: "llm-gateway",
    child: true,
    // TODO: start month for llm-gateway (hidden until set).
    end: "now",
    accent: "coral",
    detail: "A Node.js service on AWS that sits between apps and multiple model providers behind one API.",
  },
  {
    id: "statement-analyzer",
    label: "statement-analyzer",
    child: true,
    // TODO: start month for statement-analyzer (hidden until set).
    end: "now",
    accent: "coral",
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
  /** TODO: repo / live URLs (none yet). */
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
    tags: ["Node.js", "TypeScript", "AWS Lambda", "API Gateway", "DynamoDB", "SQS"],
    accent: "teal",
  },
};

export const terminal = {
  id: "api",
  heading: "Try the API",
  intro: "This site has a small read-only JSON API, and the trace above is a real request to it. Run a call and watch a live span land in the trace.",
  presets: ["/api/engineers/abhineet-deep", "/api/projects", "/api/health", "/api/nope"],
  placeholder: "/api/projects/flowsmith",
  hint: "Type any /api/* path and press Enter. Up and down arrows recall earlier requests. The OpenAPI document is at /api/openapi.json.",
  empty: "Pick a request above, or type one below.",
  invalid: "Only same-site /api/* paths can be requested here.",
  networkError: "The request failed before a response arrived.",
};

export type FlowStepId = "client" | "gateway" | "idem" | "payment" | "queue" | "ledger" | "webhook" | "dlq" | "retry";

// A generic picture of an idempotent payment API. It is not any employer's system.
// Each explanation is 40 words or fewer.
export const paymentFlow = {
  id: "flow",
  heading: "How a payment request flows",
  intro: "A generic picture of an idempotent payment API, not any particular company's system. Send a request, or break the ledger step to watch retry and the dead-letter queue.",
  send: "Send request",
  running: "Running",
  simulate: "Simulate failure",
  hint: "Select any step to read what it does.",
  doneOk: "Settled. The client is told by webhook.",
  doneFail: "Gave up after 3 attempts. The message waits in the dead-letter queue for inspection and replay.",
  waiting: (secs: number) => `Ledger write failed. Retrying in ${secs} s (shown sped up).`,
  steps: {
    client: { label: "Client", text: "Sends the payment with an idempotency key, so retrying after a timeout cannot charge the customer twice." },
    gateway: { label: "API Gateway", text: "The front door. It authenticates the caller, applies throttling and routes the request on to the payment service." },
    idem: { label: "Idempotency check", text: "Looks the key up in a store. A repeated key returns the saved result instead of running the payment a second time." },
    payment: { label: "Payment service", text: "Validates the request, records it as pending and puts the work on a queue so the caller is not kept waiting." },
    queue: { label: "Queue", text: "Buffers the work and absorbs traffic spikes. A message that fails is delivered again, with growing delays between attempts." },
    ledger: { label: "Ledger", text: "Writes the debit and credit entries as the source of truth. The write is keyed, so repeating it is safe." },
    webhook: { label: "Webhook", text: "Tells the client the payment settled. It is signed so the receiver can trust it, and retried until acknowledged." },
    dlq: { label: "Dead-letter queue", text: "Holds messages that kept failing, for inspection and replay, so one bad message cannot block the ones behind it." },
    retry: { label: "retry with backoff", text: "Waits longer after each failed attempt, for example 1 s then 2 s, so a struggling dependency is not hammered. After the last attempt the message moves to the dead-letter queue." },
  } satisfies Record<FlowStepId, { label: string; text: string }>,
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

/** Groups of items from `stack` above; an item can belong to more than one group. */
export const stackGroups: { id: string; label: string; items: string[] }[] = [
  { id: "runtime", label: "Runtime & languages", items: ["Node.js", "TypeScript", "Express", "React", "GraphQL", "Swagger/OpenAPI"] },
  { id: "aws", label: "AWS", items: ["AWS Lambda", "API Gateway", "DynamoDB", "SQS", "SNS", "EventBridge", "IAM", "CDK", "EC2"] },
  { id: "data", label: "Data", items: ["MongoDB", "MySQL", "PostgreSQL", "Redis"] },
  { id: "messaging", label: "Messaging", items: ["SQS", "SNS", "EventBridge", "Kafka"] },
  { id: "tooling", label: "Testing & tooling", items: ["Jest", "Mocha", "Docker"] },
];

export const stackSection = { heading: "Stack by area", all: "All" };

export const marqueeAccents: Accent[] = ["teal", "iris", "amber", "coral"];

export type Job = {
  org: string;
  /** All optional: a missing field is simply not rendered. */
  period?: string;
  role?: string;
  description?: string;
};

export const experience = {
  id: "experience",
  heading: "Where I've worked",
  jobs: [
    {
      org: "Tata Consultancy Services",
      // TODO: period, job title and what I built here.
    },
    {
      org: "Virtusa",
      role: "Backend engineer",
      // TODO: period and what I'm working on.
    },
  ] as Job[],
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

export const notFound = {
  heading: "No route for that page",
  home: "Back to home",
  error: { code: "not_found" },
};

export const footer = "Built with Next.js, Tailwind and Framer Motion. Press ⌘K to get around.";

export const palette = {
  empty: 'No matching command. Try "projects" or "email".',
  placeholder: "Type a command or search",
};
