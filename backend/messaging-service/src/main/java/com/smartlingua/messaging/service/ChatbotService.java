package com.smartlingua.messaging.service;

import com.smartlingua.messaging.dto.ChatbotMessageResponse;
import com.smartlingua.messaging.dto.ResourceDto;
import com.smartlingua.messaging.entity.ChatHistory;
import com.smartlingua.messaging.repository.ChatHistoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class ChatbotService {

    private static final Logger log = LoggerFactory.getLogger(ChatbotService.class);

    @Autowired
    private ChatHistoryRepository chatHistoryRepository;

    public ChatbotMessageResponse processMessage(Long userId, String message, String level) {
        String resolvedLevel = (level != null && !level.isBlank()) ? level.toUpperCase(Locale.ROOT) : "A1";
        String reply = generateReply(message, resolvedLevel);

        ChatHistory history = new ChatHistory();
        history.setUserId(userId);
        history.setMessage(message);
        history.setResponse(reply);
        history.setLevelUsed(resolvedLevel);
        chatHistoryRepository.save(history);

        return new ChatbotMessageResponse(reply, resolvedLevel, level == null || level.isBlank(), new ArrayList<>());
    }

    public List<ChatHistory> getHistory(Long userId) {
        return chatHistoryRepository.findTop30ByUserIdOrderByCreatedAtDesc(userId);
    }

    private String generateReply(String message, String level) {
        if (message == null || message.isBlank()) return "Please ask me a question about language learning!";
        String lower = message.toLowerCase(Locale.ROOT);
        if (lower.contains("hello") || lower.contains("hi") || lower.contains("bonjour")) {
            return "Hello! I'm SmartLingua's learning assistant. How can I help you today? Your level is " + level + ".";
        }
        if (lower.contains("vocabulary") || lower.contains("word") || lower.contains("vocab")) {
            return "For " + level + " level, I recommend practicing basic vocabulary with flashcards and spaced repetition.";
        }
        if (lower.contains("grammar") || lower.contains("conjugation")) {
            return "Grammar is key! At " + level + " level, focus on sentence structure and common verb tenses.";
        }
        if (lower.contains("pronunciation") || lower.contains("speaking")) {
            return "Practice pronunciation by listening to native speakers and repeating. Try shadowing exercises!";
        }
        return "That's a great question! For " + level + " level learners, I'd suggest focusing on practical exercises. What topic interests you most?";
    }
}
