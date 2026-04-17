package com.smartlingua.messaging.controller;

import com.smartlingua.messaging.dto.ChatbotMessageRequest;
import com.smartlingua.messaging.dto.ChatbotMessageResponse;
import com.smartlingua.messaging.entity.ChatHistory;
import com.smartlingua.messaging.service.ChatbotService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messaging/chatbot")
@Tag(name = "Chatbot", description = "AI chatbot interactions")
public class ChatbotController {

    @Autowired private ChatbotService chatbotService;

    @PostMapping("/message")
    @Operation(summary = "Send a message to the chatbot")
    public ResponseEntity<ChatbotMessageResponse> processMessage(@RequestBody ChatbotMessageRequest request) {
        ChatbotMessageResponse response = chatbotService.processMessage(request.getUserId(), request.getMessage(), request.getLevel());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history/{userId}")
    @Operation(summary = "Get chatbot conversation history")
    public ResponseEntity<List<ChatHistory>> getHistory(@PathVariable Long userId) {
        return ResponseEntity.ok(chatbotService.getHistory(userId));
    }
}
