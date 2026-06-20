import { defineTool } from "eve/tools";
import { z } from "zod";

const contentSignals = [
  {
    id: "spring-ai-rag",
    title: "Spring AI RAG patterns for enterprise Java apps",
    source: "Spring AI documentation",
    url: "https://docs.spring.io/spring-ai/reference/",
    category: "spring",
    freshness: 86,
    relevance: 95,
    summary:
      "Spring AI continues to standardize common AI application building blocks for Java teams, including chat clients, advisors, vector stores, and retrieval augmented generation patterns.",
    recommendedAngle:
      "Explain RAG using the mental model Java developers already know: service layer, repository abstraction, configuration properties, and testable components.",
  },
  {
    id: "spring-boot-observability",
    title: "Spring Boot observability for AI-enhanced services",
    source: "Spring Boot reference documentation",
    url: "https://docs.spring.io/spring-boot/reference/actuator/observability.html",
    category: "spring",
    freshness: 78,
    relevance: 88,
    summary:
      "As AI calls enter backend services, metrics, traces, and failure visibility become more important than raw prompt examples.",
    recommendedAngle:
      "Show how to observe an AI-backed Spring Boot endpoint with Actuator and Micrometer before discussing model quality.",
  },
  {
    id: "java-virtual-threads",
    title: "Virtual threads change blocking integration design",
    source: "OpenJDK documentation",
    url: "https://openjdk.org/jeps/444",
    category: "java",
    freshness: 72,
    relevance: 90,
    summary:
      "Virtual threads make many blocking integration styles practical again, but do not remove the need to understand IO, pooling, and database constraints.",
    recommendedAngle:
      "Compare RestClient plus virtual threads with reactive WebClient for ordinary Spring service integrations.",
  },
  {
    id: "agent-workflows-java",
    title: "Agent workflows need boring backend discipline",
    source: "Vercel Eve repository",
    url: "https://github.com/vercel/eve",
    category: "ai",
    freshness: 92,
    relevance: 82,
    summary:
      "Agent frameworks are shifting from prompt demos toward durable sessions, tool boundaries, approvals, schedules, and evals.",
    recommendedAngle:
      "Translate agent framework concepts into backend architecture terms familiar to Spring developers.",
  },
  {
    id: "mcp-in-java-teams",
    title: "MCP as an integration layer for internal tools",
    source: "Model Context Protocol specification",
    url: "https://modelcontextprotocol.io/",
    category: "ai",
    freshness: 84,
    relevance: 76,
    summary:
      "MCP is becoming a common interface for letting agents access tools, docs, issue trackers, databases, and internal services.",
    recommendedAngle:
      "Explain where MCP fits relative to REST, OpenAPI, SDKs, and Spring-based internal platforms.",
  },
];

export default defineTool({
  description:
    "Collect source-shaped Java, Spring, and AI content signals for SpringForAll planning. The current prototype uses curated demo signals with real source URLs.",
  inputSchema: z.object({
    focus: z
      .string()
      .default("Java, Spring, and applied AI")
      .describe("The editorial focus to filter or explain signals against."),
    limit: z.number().int().min(1).max(10).default(5),
  }),
  outputSchema: z.object({
    focus: z.string(),
    signals: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        source: z.string(),
        url: z.string(),
        category: z.string(),
        freshness: z.number(),
        relevance: z.number(),
        summary: z.string(),
        recommendedAngle: z.string(),
      }),
    ),
    note: z.string(),
  }),
  async execute({ focus, limit }) {
    return {
      focus,
      signals: contentSignals.slice(0, limit),
      note: "Prototype data: replace this tool with live RSS, official docs, GitHub, or MCP connections in the production version.",
    };
  },
});
