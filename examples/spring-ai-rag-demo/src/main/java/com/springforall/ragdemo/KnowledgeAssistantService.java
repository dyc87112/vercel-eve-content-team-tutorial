package com.springforall.ragdemo;

import java.util.List;
import java.util.Map;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.vectorstore.QuestionAnswerAdvisor;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

@Service
public class KnowledgeAssistantService {

    private final ChatClient chatClient;

    private final VectorStore vectorStore;

    private final RagProperties properties;

    public KnowledgeAssistantService(ChatClient.Builder builder, VectorStore vectorStore, RagProperties properties) {
        this.chatClient = builder
                .defaultSystem("""
                        你是 SpringForAll 社区的技术助手。
                        回答必须面向 Java / Spring 开发者。
                        如果资料中没有依据，请明确说明不知道，不要编造版本号、API 名称或性能结论。
                        """)
                .build();
        this.vectorStore = vectorStore;
        this.properties = properties;
    }

    public RagAnswer ask(String question) {
        SearchRequest searchRequest = SearchRequest.builder()
                .query(question)
                .topK(properties.topK())
                .similarityThreshold(properties.similarityThreshold())
                .build();

        List<Document> matches = vectorStore.similaritySearch(searchRequest);

        String answer = chatClient.prompt()
                .advisors(QuestionAnswerAdvisor.builder(vectorStore)
                        .searchRequest(searchRequest)
                        .build())
                .user(question)
                .call()
                .content();

        return new RagAnswer(question, answer, matches.stream().map(SourceSnippet::from).toList());
    }

    public record RagAnswer(String question, String answer, List<SourceSnippet> sources) {
    }

    public record SourceSnippet(String title, String source, String snippet) {

        static SourceSnippet from(Document document) {
            Map<String, Object> metadata = document.getMetadata();
            String title = String.valueOf(metadata.getOrDefault("title", "unknown"));
            String source = String.valueOf(metadata.getOrDefault("source", "unknown"));
            String content = document.getText();
            String snippet = content.length() <= 120 ? content : content.substring(0, 120) + "...";
            return new SourceSnippet(title, source, snippet);
        }
    }
}
