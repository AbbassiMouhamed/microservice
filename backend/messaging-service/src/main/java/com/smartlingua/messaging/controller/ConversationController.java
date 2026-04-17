package com.smartlingua.messaging.controller;

import com.smartlingua.messaging.dto.ConversationDTO;
import com.smartlingua.messaging.service.ConversationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messaging/conversations")
@Tag(name = "Conversations", description = "Retrieve messaging conversations")
public class ConversationController {

    @Autowired private ConversationService conversationService;

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get conversations for a user")
    public ResponseEntity<List<ConversationDTO>> getUserConversations(@PathVariable Long userId) {
        return ResponseEntity.ok(conversationService.getUserConversations(userId));
    }

    @GetMapping("/{conversationId}/user/{userId}")
    @Operation(summary = "Get a conversation by ID")
    public ResponseEntity<ConversationDTO> getConversationById(@PathVariable Long conversationId, @PathVariable Long userId) {
        return ResponseEntity.ok(conversationService.getConversationById(conversationId, userId));
    }

    @GetMapping("/between/{userId1}/{userId2}")
    @Operation(summary = "Get conversation between two users")
    public ResponseEntity<ConversationDTO> getConversationBetweenUsers(@PathVariable Long userId1, @PathVariable Long userId2) {
        ConversationDTO dto = conversationService.getConversationBetweenUsers(userId1, userId2);
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.noContent().build();
    }
}
