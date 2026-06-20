---
title: "从零搭一个 Spring AI RAG 应用：Java 开发者真正需要理解的 5 个组件"
account: "SpringForAll社区"
channel: "社区文章 / didispace.com"
column: "技术文章"
status: "draft"
language: "zh-CN"
created_at: "2026-06-20"
source_topic: "spring-ai-rag-from-zero"
example_project: "../examples/spring-ai-rag-demo"
---

# 从零搭一个 Spring AI RAG 应用：Java 开发者真正需要理解的 5 个组件

如果你是一个长期写 Spring Boot 的后端开发者，最近大概率已经听过很多次 RAG、Embedding、Vector Store、Advisor 这些词。

但不少教程讲到最后，其实只做了一件事：调用一下大模型 API。

这当然可以跑通一个 demo，但离真正接进业务系统还差得很远。对 Java / Spring 团队来说，更关键的问题通常是这些：

- 业务资料怎么进入系统？
- 用户问题进来以后，怎么先查资料再问模型？
- 模型回答时如何保留来源？
- 代码应该放在 Controller、Service，还是独立的索引流程里？
- 线上怎么观察一次 AI 调用的耗时、失败和质量风险？

这篇文章不追求把所有 RAG 细节一次讲完，而是先用 Spring 开发者熟悉的方式，把一个最小 Spring AI RAG 应用拆成 5 个核心组件，并给出一个可以继续扩展的 example 工程。

## 先说结论

一个可以进入工程讨论的 Spring AI RAG 应用，至少包含 5 个组件：

1. **ChatClient**：负责和模型交互。
2. **Document Loader**：负责把业务资料变成可索引文档。
3. **EmbeddingModel**：负责把文本转换成向量。
4. **VectorStore**：负责保存向量并做相似度检索。
5. **Advisor**：负责在模型调用前，把检索到的资料塞进上下文。

如果只做第 1 点，那只是“模型调用 demo”。只有把后面几层补齐，它才开始像一个后端系统。

## 本文使用的版本

本文示例基于当前 Spring AI 官方文档中的稳定版本：

- Spring AI：`2.0.0`
- Spring Boot：`4.0.x`
- Java：`21`

Spring AI 官方文档说明：Spring AI 2.0.x 支持 Spring Boot 4.0.x 和 4.1.x；Spring AI 2.0.0 的 BOM 可以通过 `org.springframework.ai:spring-ai-bom:2.0.0` 引入。发布前建议再次打开官方文档确认版本，因为 AI 相关 starter 和 API 仍在快速演进。

## RAG 到底解决什么问题

普通模型调用大概是这样：

```text
用户问题 -> 大模型 -> 回答
```

RAG 多做了一步：

```text
用户问题 -> 检索业务资料 -> 拼接上下文 -> 大模型 -> 带资料依据的回答
```

Spring AI 官方文档对 Vector Store 的描述很直白：先把数据加载进向量数据库；当用户问题发给 AI 模型前，先检索相似文档；这些文档会作为上下文和用户问题一起交给模型。

所以，RAG 的重点不是“让模型变聪明”，而是让模型在回答前能看到你提供的业务资料。

## 组件 1：ChatClient

`ChatClient` 是 Spring AI 里和 Chat Model 交互的高层 API。它的风格很像 Spring 生态里的 `WebClient`、`RestClient`：通过 fluent API 组织 prompt、user message、advisor、tool 等内容。

最简单的调用长这样：

```java
String answer = chatClient.prompt()
        .user("Spring AI 是什么？")
        .call()
        .content();
```

在 Spring Boot 自动配置下，可以直接注入 `ChatClient.Builder`，再构建自己的 `ChatClient`：

```java
public KnowledgeAssistantService(ChatClient.Builder builder) {
    this.chatClient = builder
            .defaultSystem("你是 SpringForAll 社区的技术助手。")
            .build();
}
```

这个边界很重要。实际项目里，不建议在 Controller 里到处拼 prompt，而是把模型调用封装到明确的 Service 中。

## 组件 2：Document Loader

RAG 的第一步不是问模型，而是整理资料。

在 Spring AI 里，进入 Vector Store 的基本单位是 `Document`。一个 `Document` 至少包含正文内容，也可以带 metadata，比如来源、标题、分类、版本号。

示例工程里先用内置资料模拟知识库：

```java
new Document(
    "Spring AI 的 ChatClient 是一个 fluent API，用来和 ChatModel 交互。",
    Map.of("source", "spring-ai-reference", "title", "ChatClient")
)
```

真实项目里，这一步可以替换成：

- 读取 Markdown 文档；
- 抓取官网 FAQ；
- 同步数据库里的帮助中心文章；
- 从 Git 仓库读取内部规范；
- 对接 CMS、Notion、飞书文档或对象存储。

这一步建议独立成索引流程，而不是每次用户提问时重新加载资料。

## 组件 3：EmbeddingModel

向量检索不是直接拿字符串做 `LIKE` 查询。

Document 进入 Vector Store 前，需要先通过 Embedding Model 转成向量。Spring AI 文档也特别强调：Vector Store 负责存储和相似度检索，但它本身不生成 embedding；创建 embedding 需要 `EmbeddingModel`。

如果你使用 OpenAI starter，Spring Boot 自动配置会把对应的 `EmbeddingModel` 放进 Spring 容器。示例工程里用 OpenAI 的 chat 和 embedding 模型，配置如下：

```yaml
spring:
  ai:
    openai:
      api-key: ${OPENAI_API_KEY}
      chat:
        options:
          model: ${OPENAI_CHAT_MODEL:gpt-4.1-mini}
      embedding:
        options:
          model: ${OPENAI_EMBEDDING_MODEL:text-embedding-3-small}
```

这里不要把 API Key 写死在代码里。最少也应该通过环境变量注入。

## 组件 4：VectorStore

Vector Store 是 RAG 应用里的“检索层”。

Spring AI 抽象了 `VectorStore` 接口。它既可以写入文档，也可以做相似度搜索：

```java
vectorStore.add(documents);

List<Document> matches = vectorStore.similaritySearch(
        SearchRequest.builder()
                .query(question)
                .topK(4)
                .similarityThreshold(0.65)
                .build()
);
```

示例工程使用 `SimpleVectorStore`。它的好处是启动成本低，适合教程、测试和本地演示；坏处也很明显：它不是生产级向量数据库。

生产环境通常应该换成 PGvector、Redis、Elasticsearch、OpenSearch、Milvus、Qdrant、Pinecone、Weaviate 等专门的 Vector Store。

也就是说，`SimpleVectorStore` 只适合帮你理解 RAG 的工作流，不应该直接拿去上线。

## 组件 5：Advisor

如果我们手动做 RAG，大概会写出这样的代码：

1. 根据用户问题查 Vector Store。
2. 把匹配到的文档拼成 context。
3. 把 context 和问题一起塞进 prompt。
4. 调 Chat Model。
5. 返回回答和来源。

Spring AI 提供了 Advisor API，用来封装这类重复模式。对最小 RAG 场景，可以直接用 `QuestionAnswerAdvisor`。

示例工程里的核心调用如下：

```java
var searchRequest = SearchRequest.builder()
        .query(question)
        .topK(4)
        .similarityThreshold(0.65)
        .build();

String content = chatClient.prompt()
        .advisors(QuestionAnswerAdvisor.builder(vectorStore)
                .searchRequest(searchRequest)
                .build())
        .user(question)
        .call()
        .content();
```

`QuestionAnswerAdvisor` 会在模型调用前查询 Vector Store，把相关文档作为上下文注入请求中。这就是最朴素的 RAG。

## 完整调用链

把上面的组件串起来，一次请求大概是这样：

```text
HTTP 请求
  -> RagController
  -> KnowledgeAssistantService
  -> VectorStore similaritySearch
  -> QuestionAnswerAdvisor 注入上下文
  -> ChatClient 调用模型
  -> 返回 answer + sources
```

这里有个细节：示例工程会先手动查一次 `VectorStore`，把命中的文档来源返回给前端；随后又通过 `QuestionAnswerAdvisor` 让 Spring AI 把相关资料注入模型上下文。

为什么要做两次？

因为文章和接口演示需要把 sources 暴露出来，让读者知道答案来自哪里。生产项目里你可以根据需要封装得更精细，比如在 Advisor 输出、回调或业务日志中统一记录来源。

## 运行 example 工程

示例工程在：

```text
examples/spring-ai-rag-demo
```

启动前先配置环境变量：

```bash
export OPENAI_API_KEY=你的 OpenAI API Key
export OPENAI_CHAT_MODEL=gpt-4.1-mini
export OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

然后运行：

```bash
cd examples/spring-ai-rag-demo
./mvnw spring-boot:run
```

如果你没有 Maven Wrapper，也可以用本机 Maven：

```bash
mvn spring-boot:run
```

请求接口：

```bash
curl "http://localhost:8080/api/rag/ask?question=Spring%20AI%20RAG%20%E9%9C%80%E8%A6%81%E5%93%AA%E4%BA%9B%E7%BB%84%E4%BB%B6"
```

返回结构类似：

```json
{
  "question": "Spring AI RAG 需要哪些组件",
  "answer": "...",
  "sources": [
    {
      "title": "VectorStore",
      "source": "spring-ai-reference",
      "snippet": "VectorStore 用于保存文档向量并执行相似度检索..."
    }
  ]
}
```

## 工程化建议

### 1. 不要让 Controller 直接拼 prompt

Controller 应该只处理 HTTP 输入输出。模型调用、检索策略、错误处理应该放进 Service。

### 2. 索引流程和问答流程分开

资料加载、切分、embedding、写入 Vector Store，最好是独立任务。不要每次请求都重新索引。

### 3. 来源必须可追溯

技术内容助手尤其不能只给一个漂亮答案。至少要返回：

- 文档标题；
- 来源系统；
- URL 或文档 ID；
- 片段摘要；
- 命中的 metadata。

### 4. SimpleVectorStore 只用于本地演示

它适合教程，但不适合生产。真正上线时，要换成可持久化、可扩展、可观测的向量数据库。

### 5. 观测能力要尽早接入

RAG 出问题时，通常不是一句“模型不行”能解释的。你需要知道：

- 检索有没有命中文档；
- 命中的文档是否相关；
- prompt 最终拼成什么样；
- 模型调用耗时多少；
- token 成本是多少；
- 用户是否采纳答案。

Spring AI 文档提到 Advisors 也会参与 observability stack，所以后续扩展时可以接入 Actuator、Micrometer、Tracing 等能力。

## 小结

Spring AI RAG 应用不是“一个模型 API + 一个 prompt”。

对 Java / Spring 团队来说，更合理的理解方式是：

- `ChatClient` 是模型调用边界；
- `Document` 是知识库输入单元；
- `EmbeddingModel` 把文本变成向量；
- `VectorStore` 负责相似度检索；
- `Advisor` 把 RAG 模式封装成可复用能力。

先把这 5 个组件跑通，再去讨论更复杂的内容切分、混合检索、权限过滤、评测和多轮记忆，整个系统会稳很多。

## 参考资料

- Spring AI Reference: https://docs.spring.io/spring-ai/reference/
- Spring AI Getting Started: https://docs.spring.io/spring-ai/reference/getting-started.html
- Spring AI ChatClient API: https://docs.spring.io/spring-ai/reference/api/chatclient.html
- Spring AI Advisors API: https://docs.spring.io/spring-ai/reference/api/advisors.html
- Spring AI RAG: https://docs.spring.io/spring-ai/reference/api/retrieval-augmented-generation.html
- Spring AI Vector Databases: https://docs.spring.io/spring-ai/reference/api/vectordbs.html

## 发布前审校清单

- 打开 Spring AI 文档，确认 `2.0.0` 和 Spring Boot 4.0.x 的兼容关系仍然成立。
- 在本地运行 example 工程，确认 Maven 依赖可解析。
- 用真实 API Key 调用一次 `/api/rag/ask`。
- 确认 `QuestionAnswerAdvisor`、`SearchRequest`、`SimpleVectorStore`、`Document#getText()` 的包名或方法名与当前版本一致。
- 补充运行截图或终端输出。
- 如果发布到公众号，建议把“SimpleVectorStore 不适合生产”单独加粗提醒。
