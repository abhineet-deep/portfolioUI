// Data for the hero "living architecture" scene. Labels are generic and factual; no metrics about me.
import type { Accent } from "./content";

export type NodeKind = "box" | "icosa" | "cylinder" | "torus" | "octa" | "smallbox";

export type ArchNode = {
  id: string;
  label: string;
  blurb: string;
  kind: NodeKind;
  accent: Accent;
  position: [number, number, number];
  /** Kept in the simplified mobile scene. */
  mobile: boolean;
};

// teal = core services, amber = queues and streams, coral = AI
export const archNodes: ArchNode[] = [
  { id: "gateway", label: "API Gateway", blurb: "the front door: routing, auth and throttling", kind: "box", accent: "teal", position: [-3.2, 0.2, 0.3], mobile: true },
  { id: "lambda", label: "Lambda", blurb: "event-driven compute that scales to zero", kind: "icosa", accent: "teal", position: [-0.9, 0.6, -0.4], mobile: true },
  { id: "dynamo", label: "DynamoDB", blurb: "single-digit millisecond reads", kind: "cylinder", accent: "teal", position: [1.5, 1.6, 0.2], mobile: true },
  { id: "redis", label: "Redis", blurb: "in-memory cache for hot reads", kind: "smallbox", accent: "teal", position: [1.6, -0.1, 0.9], mobile: false },
  { id: "sqs", label: "SQS", blurb: "queues that absorb spikes and decouple services", kind: "torus", accent: "amber", position: [0.2, -1.8, 0.4], mobile: false },
  { id: "kafka", label: "Kafka", blurb: "durable event streams", kind: "octa", accent: "amber", position: [2.8, -1.7, -0.3], mobile: false },
  { id: "llm", label: "LLM", blurb: "a model provider behind one API", kind: "icosa", accent: "coral", position: [-1.9, -1.7, 0.6], mobile: true },
];

export const archEdges: [string, string][] = [
  ["gateway", "lambda"],
  ["lambda", "dynamo"],
  ["lambda", "redis"],
  ["lambda", "sqs"],
  ["sqs", "kafka"],
  ["gateway", "llm"],
  ["llm", "lambda"],
];

// Packet routes as node paths. Each consecutive pair must be an edge above.
export const archRoutes = {
  default: [
    ["gateway", "lambda", "dynamo"],
    ["gateway", "lambda", "redis"],
    ["lambda", "sqs", "kafka"],
    ["lambda", "llm"],
  ],
  // While the llm-gateway span is active, traffic goes through the LLM node.
  llm: [
    ["gateway", "llm", "lambda", "dynamo"],
    ["gateway", "llm", "lambda", "redis"],
    ["lambda", "sqs", "kafka"],
    ["llm", "lambda"],
  ],
} as const;

export type SpanLink = { nodes: string[]; /** Light the nodes more gently. */ soft?: boolean; reroute?: boolean };

/** Trace span id (see traceSpans in content.ts) -> nodes to light. */
export const spanHighlight: Record<string, SpanLink> = {
  root: { nodes: archNodes.map((n) => n.id), soft: true },
  tcs: { nodes: ["gateway", "lambda", "dynamo"] },
  virtusa: { nodes: ["gateway", "lambda", "dynamo"] },
  certs: { nodes: ["gateway", "lambda", "dynamo", "sqs"] },
  flowsmith: { nodes: ["llm", "sqs"] },
  "llm-gateway": { nodes: ["llm", "gateway"], reroute: true },
  "statement-analyzer": { nodes: ["llm", "dynamo"] },
};
