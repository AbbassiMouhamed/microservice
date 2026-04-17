package com.smartlingua.messaging.controller;

import com.smartlingua.messaging.dto.ConversationDTO;
import com.smartlingua.messaging.service.ConversationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messaging/conversations")
public class ConversationController {

    @Autowired private ConversationService conversationService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ConversationDTO>> getUserConversations(@PathVariable Long userId) {
        return ResponseEntity.ok(conversationService.getUserConversations(userId));
    }

    @GetMapping("/{conversationId}/user/{userId}")
    public ResponseEntity<ConversationDTO> getConversationById(@PathVariable Long conversationId, @PathVariable Long userId) {
        return ResponseEntity.ok(conversationService.getConversationById(conversationId, userId));
    }

    @GetMapping("/between/{userId1}/{userId2}")
    public ResponseEntity<ConversationDTO> getConversationBetweenUsers(@PathVariable Long userId1, @PathVariable Long userId2) {
        return ResponseEntity.ok(conversationService.getConversationBetweenUsers(userId1, userId2));
    }
}
