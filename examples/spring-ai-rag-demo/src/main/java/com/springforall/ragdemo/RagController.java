package com.springforall.ragdemo;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RagController {

    private final KnowledgeAssistantService assistantService;

    public RagController(KnowledgeAssistantService assistantService) {
        this.assistantService = assistantService;
    }

    @GetMapping("/api/rag/ask")
    KnowledgeAssistantService.RagAnswer ask(@RequestParam String question) {
        return assistantService.ask(question);
    }
}
