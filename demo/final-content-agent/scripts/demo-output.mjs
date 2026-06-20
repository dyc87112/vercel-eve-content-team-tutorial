const output = {
  request: "帮我为 SpringForAll 社区生成本周 5 个 Java / Spring / AI 方向选题，并挑一个写成公众号初稿。",
  agentFlow: [
    "load_skill(topic_planning)",
    "delegate(researcher)",
    "search_or_read_sources(Spring official docs, OpenJDK, GitHub, local backlog)",
    "score_candidates_with_skill_rules",
    "load_skill(article_writing)",
    "delegate(writer)",
    "load_skill(review_checklist)",
    "delegate(reviewer)",
  ],
  recommendedTopics: [
    {
      title: "从零搭一个 Spring AI RAG 应用：Java 开发者真正需要理解的 5 个组件",
      score: 94,
      why: "最贴近 SpringForAll 的实战教程定位，且能自然串起 Spring AI、配置、观测和工程边界。",
    },
    {
      title: "Agent 框架到底在解决什么问题？写给 Spring 开发者的后端视角",
      score: 84,
      why: "适合作为 AI Agent 系列的开篇认知文章。",
    },
    {
      title: "有了虚拟线程，Spring 项目还需要响应式编程吗？",
      score: 82,
      why: "延续 Java/Spring 工程取舍主题，容易引发讨论。",
    },
  ],
  draftStatus: "ready_for_human_review",
  requiredHumanFixes: [
    "补充真实 Maven / Gradle 依赖版本。",
    "打开官方文档核验 Spring AI API 名称。",
    "补一个最小可运行 demo 或 GitHub 仓库链接。",
  ],
};

console.log(JSON.stringify(output, null, 2));
