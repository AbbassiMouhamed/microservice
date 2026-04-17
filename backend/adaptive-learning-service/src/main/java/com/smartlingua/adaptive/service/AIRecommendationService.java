package com.smartlingua.adaptive.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AIRecommendationService {
    private final PedagogicalAiRecommendationService aiService;

    @Value("${adaptive.ai.enabled:false}")
    private boolean aiEnabled;

    public AIRecommendationService(PedagogicalAiRecommendationService aiService) {
        this.aiService = aiService;
    }

    public String getRecommendation(String systemPrompt, String userPrompt) {
        if (!aiEnabled) return getFallback();
        String result = aiService.generateRecommendation(systemPrompt, userPrompt);
        return result != null ? result : getFallback();
    }

    public String getProfileSummary(String level, String goal, int points) {
        if (!aiEnabled) return "Continue your " + level + " studies. Focus on your goal: " + goal;
        String sys = "You are a language learning advisor. Summarize the student profile briefly.";
        String user = "Level: " + level + ", Goal: " + goal + ", Points: " + points;
        String result = aiService.generateRecommendation(sys, user);
        return result != null ? result : "Continue your " + level + " studies.";
    }

    public String getLevelPromotionMessage(String oldLevel, String newLevel) {
        if (!aiEnabled) return "Congratulations! You advanced from " + oldLevel + " to " + newLevel + "!";
        String sys = "You are a motivational language tutor. Create a short congratulatory message.";
        String user = "Student promoted from " + oldLevel + " to " + newLevel;
        String result = aiService.generateRecommendation(sys, user);
        return result != null ? result : "Congratulations! You advanced from " + oldLevel + " to " + newLevel + "!";
    }

    private static String getFallback() {
        return "Keep practicing regularly to improve your skills.";
    }
}
