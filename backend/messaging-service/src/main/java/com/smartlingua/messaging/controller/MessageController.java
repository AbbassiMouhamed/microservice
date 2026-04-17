package com.smartlingua.messaging.controller;

import com.smartlingua.messaging.dto.ConversationMessageRequest;
import com.smartlingua.messaging.dto.MessageDTO;
import com.smartlingua.messaging.dto.SendMessageRequest;
import com.smartlingua.messaging.service.MessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messaging/messages")
@Tag(name = "Messages", description = "Send, read and manage messages")
public class MessageController {

    @Autowired private MessageService messageService;
    @Autowired private SimpMessagingTemplate messagingTemplate;

    @PostMapping("/send/{senderId}")
    @Operation(summary = "Send a message to a user")
    public ResponseEntity<MessageDTO> sendMessage(@PathVariable Long senderId, @RequestBody SendMessageRequest request) {
        try {
            MessageDTO message = messageService.sendMessage(senderId, request.getReceiverId(), request.getContent());
            messagingTemplate.convertAndSend("/queue/messages/" + message.getReceiverId(), message);
            messagingTemplate.convertAndSend("/queue/messages/" + message.getSenderId(), message);
            return ResponseEntity.status(HttpStatus.CREATED).body(message);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).header("X-Error-Message", e.getMessage()).body(null);
        }
    }

    @GetMapping("/conversation/{conversationId}")
    @Operation(summary = "Get messages in a conversation")
    public ResponseEntity<List<MessageDTO>> getConversationMessages(@PathVariable Long conversationId) {
        return ResponseEntity.ok(messageService.getConversationMessages(conversationId));
    }

    @PostMapping("/conversation/{conversationId}")
    @Operation(summary = "Send a message to a conversation")
    public ResponseEntity<MessageDTO> sendToConversation(@PathVariable Long conversationId,
                                                         @RequestBody ConversationMessageRequest request) {
        try {
            MessageDTO message = messageService.sendMessageToConversation(conversationId, request.getSenderId(), request.getContent());
            messagingTemplate.convertAndSend("/queue/messages/" + message.getReceiverId(), message);
            messagingTemplate.convertAndSend("/queue/messages/" + message.getSenderId(), message);
            return ResponseEntity.status(HttpStatus.CREATED).body(message);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).header("X-Error-Message", e.getMessage()).body(null);
        }
    }

    @GetMapping("/between/{userId1}/{userId2}")
    @Operation(summary = "Get messages between two users")
    public ResponseEntity<List<MessageDTO>> getMessagesBetweenUsers(@PathVariable Long userId1, @PathVariable Long userId2) {
        return ResponseEntity.ok(messageService.getMessagesBetweenUsers(userId1, userId2));
    }

    @PutMapping("/mark-read/{userId}/{conversationId}")
    @Operation(summary = "Mark messages as read")
    public ResponseEntity<Void> markMessagesAsRead(@PathVariable Long userId, @PathVariable Long conversationId) {
        messageService.markMessagesAsRead(userId, conversationId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/unread-count/{userId}")
    @Operation(summary = "Get unread message count")
    public ResponseEntity<Long> getUnreadCount(@PathVariable Long userId) {
        return ResponseEntity.ok(messageService.countUnreadMessages(userId));
    }

    @GetMapping("/unread/{userId}")
    @Operation(summary = "Get unread messages")
    public ResponseEntity<List<MessageDTO>> getUnreadMessages(@PathVariable Long userId) {
        return ResponseEntity.ok(messageService.getUnreadMessages(userId));
    }
}
