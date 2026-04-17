package com.smartlingua.adaptive.service;

import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PedagogicalAiRecommendationService {
    private static final Logger log = LoggerFactory.getLogger(PedagogicalAiRecommendationService.class);

    private final ChatModel chatModel;

    public PedagogicalAiRecommendationService(
            @org.springframework.lang.Nullable ChatModel chatModel) {
        this.chatModel = chatModel;
    }

    public String generateRecommendation(String systemPrompt, String userPrompt) {
        if (chatModel == null) {
            log.debug("ChatModel not available, returning null");
            return null;
        }
        try {
            Prompt prompt = new Prompt(List.of(
                    new SystemMessage(systemPrompt),
                    new UserMessage(userPrompt)));
            ChatResponse response = chatModel.call(prompt);
            if (response != null && response.getResult() != null
                    && response.getResult().getOutput() != null) {
                return response.getResult().getOutput().getText();
            }
        } catch (Exception e) {
            log.warn("AI recommendation failed: {}", e.getMessage());
        }
        return null;
    }
}
