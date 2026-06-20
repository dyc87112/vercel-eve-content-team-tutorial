import { defineTool } from "eve/tools";
import { z } from "zod";
import { findSignals, topicCandidates } from "../lib/content-data.js";

export default defineTool({
  description:
    "Score SpringForAll topic candidates by freshness, reader value, source support, and implementation potential.",
  inputSchema: z.object({
    maxTopics: z.number().int().min(1).max(8).default(5),
    preferHandsOn: z.boolean().default(true),
  }),
  outputSchema: z.object({
    topics: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        score: z.number(),
        angle: z.string(),
        targetReader: z.string(),
        difficulty: z.string(),
        whyNow: z.string(),
        sourceAnchors: z.array(
          z.object({
            title: z.string(),
            source: z.string(),
            url: z.string(),
          }),
        ),
      }),
    ),
  }),
  async execute({ maxTopics, preferHandsOn }) {
    const topics = topicCandidates
      .map((topic) => {
        const signals = findSignals(topic.sourceIds);
        const sourceScore = signals.length * 8;
        const handsOnBoost = preferHandsOn && topic.title.includes("从零") ? 8 : 0;
        const score = Math.min(100, Math.round(topic.freshness * 0.55 + sourceScore + handsOnBoost + 20));

        return {
          id: topic.id,
          title: topic.title,
          score,
          angle: topic.angle,
          targetReader: topic.targetReader,
          difficulty: topic.difficulty,
          whyNow: topic.whyNow,
          sourceAnchors: signals.map((signal) => ({
            title: signal.title,
            source: signal.source,
            url: signal.url,
          })),
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, maxTopics);

    return { topics };
  },
});
