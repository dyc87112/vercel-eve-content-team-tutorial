# Sample Output

用户请求：

> 帮我为 SpringForAll 社区生成本周 5 个 Java / Spring / AI 方向选题，并挑一个最适合复更的主题写成公众号初稿。

## 本周推荐选题

### 1. 从零搭一个 Spring AI RAG 应用：Java 开发者真正需要理解的 5 个组件

- 推荐分：94
- 读者：熟悉 Spring Boot，想把 AI 能力接入业务系统的后端开发者
- 难度：进阶
- 角度：用 Spring 开发者熟悉的分层架构解释 RAG，而不是只堆 prompt 和向量库名词。
- 为什么现在写：越来越多 Java 团队开始接入 AI，但很多教程停留在调用模型 API，没有讲清楚工程边界。
- 来源锚点：
  - Spring AI documentation: https://docs.spring.io/spring-ai/reference/
  - Spring Boot observability: https://docs.spring.io/spring-boot/reference/actuator/observability.html

### 2. Agent 框架到底在解决什么问题？写给 Spring 开发者的后端视角

- 推荐分：84
- 读者：对 AI Agent 感兴趣但不想停留在提示词玩法的 Java/Spring 开发者
- 难度：进阶
- 角度：把 durable session、tools、approval、schedule、evals 翻译成 Spring 开发者熟悉的后台任务和集成系统概念。
- 来源锚点：
  - Vercel Eve: https://github.com/vercel/eve
  - Model Context Protocol: https://modelcontextprotocol.io/

### 3. 有了虚拟线程，Spring 项目还需要响应式编程吗？

- 推荐分：82
- 读者：正在维护 Spring MVC / WebFlux 项目的后端开发者
- 难度：深入
- 角度：比较虚拟线程、RestClient、WebClient 和响应式编程在普通后端集成里的取舍。
- 来源锚点：
  - OpenJDK JEP 444: https://openjdk.org/jeps/444

## 推荐复更首篇

我建议先写第 1 篇：**从零搭一个 Spring AI RAG 应用：Java 开发者真正需要理解的 5 个组件**。

原因：

- 和 SpringForAll 的账号定位最贴合。
- 既有 AI 热度，也能落到 Spring Boot 实战。
- 后续可以自然拆成系列：RAG、Vector Store、Advisor、Observability、评测与上线。

## 初稿

```yaml
---
title: "从零搭一个 Spring AI RAG 应用：Java 开发者真正需要理解的 5 个组件"
account: "SpringForAll社区"
channel: "社区文章 / didispace.com"
column: "技术文章"
status: "draft"
language: "zh-CN"
created_at: "2026-06-20"
---
```

# 从零搭一个 Spring AI RAG 应用：Java 开发者真正需要理解的 5 个组件

如果你是一个长期写 Spring Boot 的后端开发者，最近大概率已经听过很多次 RAG、Agent、Vector Store、Embedding 这些词。

但问题是：很多教程讲到最后，还是停在“调用一下大模型 API”。

这对真正要把 AI 能力接进业务系统的 Java 团队来说远远不够。我们更关心的是：

- 这些组件分别应该放在 Spring 项目的哪一层？
- 配置、密钥、超时和异常怎么管理？
- 检索结果错了怎么办？
- 线上如何观察一次 AI 调用到底发生了什么？

这篇文章先不追求大而全，而是用 Spring 开发者熟悉的方式，把一个最小 RAG 应用拆成 5 个关键组件。

## 先说结论

一个可以进入工程讨论的 Spring AI RAG 应用，至少应该包含：

1. Chat Client：负责和模型交互。
2. Document Loader：负责把业务资料变成可处理的文档。
3. Vector Store：负责存储和检索语义向量。
4. Retrieval / Advisor：负责把检索结果注入模型上下文。
5. Observability：负责记录调用链路、耗时、失败和质量风险。

如果只做第 1 点，那只是模型调用 demo；只有把后面几个组件补齐，它才开始像一个后端系统。

## 最小实现路径

第一步，不要急着选模型。先定义业务问题：

> 用户输入一个 Spring Boot 集成问题，系统从内部知识库检索相关资料，再生成带来源的回答。

第二步，用 Spring Boot 配置体系管理外部能力：

```yaml
spring:
  ai:
    # TODO: 发布前按实际 Spring AI 版本核验配置项名称
```

第三步，把模型调用封装在 Service 边界内，而不是散落在 Controller 中。

```java
@Service
public class KnowledgeAssistantService {

    public String answer(String question) {
        // TODO: 接入 Spring AI ChatClient、VectorStore 和 Advisor
        return "draft answer";
    }
}
```

这个示例还不是可发布代码。发布前需要基于最新 Spring AI 文档补齐真实依赖、配置和实现。

## 工程化注意事项

- 不要把 API Key 写进代码或 prompt。
- 检索结果必须保留来源，方便人工和用户追溯。
- AI 调用必须有超时、重试和降级策略。
- 对外输出前要区分“资料中明确写了”和“模型推断认为”。
- 线上必须观察 token、耗时、错误率和用户反馈。

## 什么场景适合先做

适合：

- 内部知识库问答；
- 技术文档助手；
- 客服或支持场景的辅助回答；
- 研发团队自己的 FAQ。

暂缓：

- 强事务决策；
- 没有明确资料来源的问题；
- 对合规、金融、医疗等高风险结论负责的场景。

## 发布前人工审校清单

- 核验 Spring AI 最新版本和依赖坐标。
- 核验 `ChatClient`、`VectorStore`、`Advisor` 等 API 名称。
- 补齐一个最小可运行 GitHub 示例。
- 打开所有来源链接，确认内容仍然有效。
- 检查文章是否过度承诺 RAG 的准确性。

## 审稿结论

- 状态：ready_for_human_review
- 分数：87
- 主要风险：当前草稿需要补齐真实代码和版本核验后才能发布。
