import { defineTool } from "eve/tools";
import { z } from "zod";
import { contentSignals } from "../lib/content-data.js";

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
