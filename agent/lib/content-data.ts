export type Signal = {
  id: string;
  title: string;
  source: string;
  url: string;
  category: "spring" | "java" | "ai" | "tooling";
  freshness: number;
  relevance: number;
  summary: string;
  recommendedAngle: string;
};

export type TopicCandidate = {
  id: string;
  title: string;
  angle: string;
  targetReader: string;
  difficulty: "入门" | "进阶" | "深入";
  freshness: number;
  sourceIds: string[];
  whyNow: string;
};

export const accountProfile = {
  account: "SpringForAll社区",
  channel: "社区文章 / didispace.com",
  column: "技术文章",
  audience: "Spring / Java 开发者",
  styleRules: [
    "以实战步骤为主，代码示例完整可运行。",
    "说明依赖版本与配置要点。",
    "适当关联 didispace.com 或社区资源。",
    "所有发布内容必须人工审校。",
  ],
};

export const contentSignals: Signal[] = [
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

export const topicCandidates: TopicCandidate[] = [
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

export function findSignals(ids: string[]) {
  return ids
    .map((id) => contentSignals.find((signal) => signal.id === id))
    .filter((signal): signal is Signal => Boolean(signal));
}
