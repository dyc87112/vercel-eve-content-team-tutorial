package com.springforall.ragdemo;

import java.util.List;
import java.util.Map;

import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class KnowledgeBaseInitializer {

    @Bean
    ApplicationRunner loadKnowledgeBase(VectorStore vectorStore) {
        return args -> vectorStore.add(List.of(
                document(
                        "ChatClient",
                        "spring-ai-reference",
                        "Spring AI 的 ChatClient 是一个 fluent API，用来和 ChatModel 交互。"
                                + " 在 Spring Boot 自动配置下，可以注入 ChatClient.Builder，然后构建带默认 system prompt 的 ChatClient。"),
                document(
                        "Document",
                        "spring-ai-reference",
                        "Spring AI 使用 Document 表示进入知识库的文本资料。Document 可以包含正文内容和 metadata，"
                                + "例如标题、来源、版本、URL 或业务分类。"),
                document(
                        "EmbeddingModel",
                        "spring-ai-reference",
                        "Vector Store 不负责生成 embedding。文本写入向量库前，需要通过 EmbeddingModel 转换为向量。"
                                + " 具体模型可以来自 OpenAI、Azure OpenAI、Ollama、Mistral、Google GenAI 等 provider。"),
                document(
                        "VectorStore",
                        "spring-ai-reference",
                        "VectorStore 负责保存文档向量并执行相似度检索。Spring AI 抽象了 VectorStore 接口，"
                                + "支持 add、delete 和 similaritySearch 等操作。"),
                document(
                        "QuestionAnswerAdvisor",
                        "spring-ai-reference",
                        "QuestionAnswerAdvisor 会在模型调用前查询 VectorStore，把相关文档追加到用户问题上下文中，"
                                + "用于实现最朴素的 Retrieval Augmented Generation。"),
                document(
                        "SimpleVectorStore",
                        "spring-ai-reference",
                        "SimpleVectorStore 是一个适合测试和演示的简单向量存储实现，不适合生产环境。"
                                + " 生产环境应替换为 PGvector、Redis、Elasticsearch、OpenSearch、Milvus、Qdrant 等。")
        ));
    }

    private static Document document(String title, String source, String content) {
        return new Document(content, Map.of(
                "title", title,
                "source", source
        ));
    }
}
