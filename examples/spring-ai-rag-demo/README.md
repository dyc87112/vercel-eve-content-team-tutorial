# Spring AI RAG Demo

一个配套文章的最小 Spring Boot + Spring AI RAG 示例工程。

它演示：

- 用 `ChatClient` 调用模型；
- 用 `Document` 加载知识库资料；
- 用 `SimpleVectorStore` 做本地向量检索；
- 用 `QuestionAnswerAdvisor` 把检索结果注入模型上下文；
- 返回回答和命中文档来源。

## Requirements

- Java 21+
- Maven 3.9+
- OpenAI API Key

## Run

```bash
export OPENAI_API_KEY=your-api-key
export OPENAI_CHAT_MODEL=gpt-4.1-mini
export OPENAI_EMBEDDING_MODEL=text-embedding-3-small

mvn spring-boot:run
```

Ask:

```bash
curl "http://localhost:8080/api/rag/ask?question=Spring%20AI%20RAG%20%E9%9C%80%E8%A6%81%E5%93%AA%E4%BA%9B%E7%BB%84%E4%BB%B6"
```

## Notes

`SimpleVectorStore` is used only for local demos and tests. Replace it with PGvector, Redis, Elasticsearch, OpenSearch, Milvus, Qdrant, Pinecone, or another production vector store before shipping.
