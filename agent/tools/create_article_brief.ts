import { defineTool } from "eve/tools";
import { z } from "zod";

const accountProfile = {
  account: "SpringForAll社区",
  channel: "社区文章 / didispace.com",
  column: "技术文章",
};

const contentSignals = [
  {
    id: "spring-ai-rag",
    title: "Spring AI RAG patterns for enterprise Java apps",
    url: "https://docs.spring.io/spring-ai/reference/",
  },
  {
    id: "spring-boot-observability",
    title: "Spring Boot observability for AI-enhanced services",
    url: "https://docs.spring.io/spring-boot/reference/actuator/observability.html",
  },
  {
    id: "java-virtual-threads",
    title: "Virtual threads change blocking integration design",
    url: "https://openjdk.org/jeps/444",
  },
  {
    id: "agent-workflows-java",
    title: "Agent workflows need boring backend discipline",
    url: "https://github.com/vercel/eve",
  },
  {
    id: "mcp-in-java-teams",
    title: "MCP as an integration layer for internal tools",
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
    "Create a structured SpringForAll article brief and first draft scaffold from a selected topic id.",
  inputSchema: z.object({
    topicId: z.string().describe("A topic id returned by score_topics."),
    draftDepth: z.enum(["outline", "short_draft", "full_draft"]).default("short_draft"),
  }),
  outputSchema: z.object({
    frontMatter: z.record(z.string(), z.string()),
    title: z.string(),
    summary: z.string(),
    outline: z.array(z.string()),
    draft: z.string(),
    sources: z.array(z.object({ title: z.string(), url: z.string() })),
    checklist: z.array(z.string()),
  }),
  async execute({ topicId, draftDepth }) {
    const topic = topicCandidates.find((item) => item.id === topicId) ?? topicCandidates[0]!;
    const signals = findSignals(topic.sourceIds);
    const today = new Date().toISOString().slice(0, 10);

    const outline = [
      "为什么现在值得关注这个问题",
      "核心概念：用 Java/Spring 开发者熟悉的语言解释",
      "最小可运行实现路径",
      "工程化注意事项：配置、观测、异常、成本与边界",
      "适合采用与暂缓采用的场景",
      "发布前需要人工核验的事实点",
    ];

    const draft =
      draftDepth === "outline"
        ? "本次只生成提纲，不展开正文。"
        : [
            `# ${topic.title}`,
            "",
            `如果你是一个长期写 Spring Boot 的后端开发者，${topic.angle}`,
            "",
            "这篇文章不打算把问题讲成一个新的流行词，而是从工程落地出发：我们要知道它解决什么问题、放在 Spring 项目里的哪个位置、什么时候值得引入，以及哪里必须谨慎。",
            "",
            "## 先说结论",
            "",
            `这篇内容面向${topic.targetReader}。推荐关注它的原因是：${topic.whyNow}`,
            "",
            "## 最小实现路径",
            "",
            "1. 明确业务输入和输出，不要先从模型或框架开始。",
            "2. 用 Spring Boot 的配置体系管理外部服务、模型参数和超时。",
            "3. 把 AI 或外部能力封装在明确的 service 边界内。",
            "4. 为关键调用补充日志、指标和失败兜底。",
            "5. 在发布前人工核验版本号、API 名称和来源链接。",
            "",
            "## 值得继续展开的代码部分",
            "",
            "- Maven / Gradle 依赖版本",
            "- `application.yml` 配置",
            "- 一个最小 Controller",
            "- 一个可替换实现的 Service",
            "- 一组失败场景测试",
            "",
            "## 人工审校提醒",
            "",
            "当前草稿来自 Agent 原型，应在发布前补充真实代码、运行截图和最新官方文档核验。",
          ].join("\n");

    return {
      frontMatter: {
        title: topic.title,
        account: accountProfile.account,
        channel: accountProfile.channel,
        column: accountProfile.column,
        status: "draft",
        language: "zh-CN",
        created_at: today,
      },
      title: topic.title,
      summary: topic.angle,
      outline,
      draft,
      sources: signals.map((signal) => ({ title: signal.title, url: signal.url })),
      checklist: [
        "核验所有依赖版本和 API 名称。",
        "补齐可运行代码示例。",
        "确认来源链接是一手资料或官方文档。",
        "检查是否符合 SpringForAll 社区读者画像。",
        "发布前由人工确认标题、摘要和技术结论。",
      ],
    };
  },
});
