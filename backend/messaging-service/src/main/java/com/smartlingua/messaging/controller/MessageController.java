package com.smartlingua.messaging.controller;

import com.smartlingua.messaging.dto.ConversationMessageRequest;
import com.smartlingua.messaging.dto.MessageDTO;
import com.smartlingua.messaging.dto.SendMessageRequest;
import com.smartlingua.messaging.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messaging/messages")
public class MessageController {

    @Autowired private MessageService messageService;
    @Autowired private SimpMessagingTemplate messagingTemplate;

    @PostMapping("/send/{senderId}")
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
    public ResponseEntity<List<MessageDTO>> getConversationMessages(@PathVariable Long conversationId) {
        return ResponseEntity.ok(messageService.getConversationMessages(conversationId));
    }

    @PostMapping("/conversation/{conversationId}")
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
    public ResponseEntity<List<MessageDTO>> getMessagesBetweenUsers(@PathVariable Long userId1, @PathVariable Long userId2) {
        return ResponseEntity.ok(messageService.getMessagesBetweenUsers(userId1, userId2));
    }

    @PutMapping("/mark-read/{userId}/{conversationId}")
    public ResponseEntity<Void> markMessagesAsRead(@PathVariable Long userId, @PathVariable Long conversationId) {
        messageService.markMessagesAsRead(userId, conversationId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/unread-count/{userId}")
    public ResponseEntity<Long> getUnreadCount(@PathVariable Long userId) {
        return ResponseEntity.ok(messageService.countUnreadMessages(userId));
    }

    @GetMapping("/unread/{userId}")
    public ResponseEntity<List<MessageDTO>> getUnreadMessages(@PathVariable Long userId) {
        return ResponseEntity.ok(messageService.getUnreadMessages(userId));
    }
}
