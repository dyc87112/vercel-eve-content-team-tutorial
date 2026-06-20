import { defineTool } from "eve/tools";
import { z } from "zod";

const contentSignals = [
  {
    id: "spring-ai-rag",
    title: "Spring AI RAG patterns for enterprise Java apps",
    source: "Spring AI documentation",
    url: "https://docs.spring.io/spring-ai/reference/",
  },
  {
    id: "spring-boot-observability",
    title: "Spring Boot observability for AI-enhanced services",
    source: "Spring Boot reference documentation",
    url: "https://docs.spring.io/spring-boot/reference/actuator/observability.html",
  },
  {
    id: "java-virtual-threads",
    title: "Virtual threads change blocking integration design",
    source: "OpenJDK documentation",
    url: "https://openjdk.org/jeps/444",
  },
  {
    id: "agent-workflows-java",
    title: "Agent workflows need boring backend discipline",
    source: "Vercel Eve repository",
    url: "https://github.com/vercel/eve",
  },
  {
    id: "mcp-in-java-teams",
    title: "MCP as an integration layer for internal tools",
    source: "Model Context Protocol specification",
    url: "https://modelcontextprotocol.io/",
  },
];

const topicCandidates = [
  {
    id: "spring-ai-rag-from-zero",
    title: "从零搭一个 Spring AI RAG 应用：Java 开发者真正需要理解的 5 个组件",
    angle:
      "用 Spring 开发者熟悉的分层架构解释 RAG，而不是只堆 prompt 和向量库名词。",
    targetReader: "熟悉 Spring Boot，想把 AI 能力接入业务系统的后端开发者",
    difficulty: "进阶",
    freshness: 90,
    sourceIds: ["spring-ai-rag", "spring-boot-observability"],
    whyNow:
      "越来越多 Java 团队开始接入 AI，但很多教程停留在调用模型 API，没有讲清楚工程边界。",
  },
  {
    id: "restclient-virtual-threads",
    title: "有了虚拟线程，Spring 项目还需要响应式编程吗？",
    angle:
      "比较虚拟线程、RestClient、WebClient 和响应式编程在普通后端集成里的取舍。",
    targetReader: "正在维护 Spring MVC / WebFlux 项目的后端开发者",
    difficulty: "深入",
    freshness: 78,
    sourceIds: ["java-virtual-threads"],
    whyNow:
      "Java 21 之后虚拟线程已经进入稳定阶段，很多团队需要重新审视过去为了非阻塞而引入的复杂度。",
  },
  {
    id: "agent-framework-for-spring-devs",
    title: "Agent 框架到底在解决什么问题？写给 Spring 开发者的后端视角",
    angle:
      "把 durable session、tools、approval、schedule、evals 翻译成 Spring 开发者熟悉的后台任务和集成系统概念。",
    targetReader: "对 AI Agent 感兴趣但不想停留在提示词玩法的 Java/Spring 开发者",
    difficulty: "进阶",
    freshness: 88,
    sourceIds: ["agent-workflows-java", "mcp-in-java-teams"],
    whyNow:
      "Agent 从玩具 demo 走向生产系统时，后端开发者熟悉的可靠性、权限和审计能力变得关键。",
  },
];

function findSignals(ids: string[]) {
  return ids
    .map((id) => contentSignals.find((signal) => signal.id === id))
    .filter((signal): signal is (typeof contentSignals)[number] => Boolean(signal));
}

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
