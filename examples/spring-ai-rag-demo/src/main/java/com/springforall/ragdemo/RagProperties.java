package com.springforall.ragdemo;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "rag.search")
public record RagProperties(
        int topK,
        double similarityThreshold
) {
}
