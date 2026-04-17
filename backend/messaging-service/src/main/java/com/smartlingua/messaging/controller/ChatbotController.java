package com.smartlingua.messaging.controller;

import com.smartlingua.messaging.dto.ChatbotMessageRequest;
import com.smartlingua.messaging.dto.ChatbotMessageResponse;
import com.smartlingua.messaging.entity.ChatHistory;
import com.smartlingua.messaging.service.ChatbotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messaging/chatbot")
public class ChatbotController {

    @Autowired private ChatbotService chatbotService;

    @PostMapping("/message")
    public ResponseEntity<ChatbotMessageResponse> processMessage(@RequestBody ChatbotMessageRequest request) {
        ChatbotMessageResponse response = chatbotService.processMessage(request.getUserId(), request.getMessage(), request.getLevel());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<List<ChatHistory>> getHistory(@PathVariable Long userId) {
        return ResponseEntity.ok(chatbotService.getHistory(userId));
    }
}
