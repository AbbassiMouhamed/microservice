package com.smartlingua.messaging.controller;

import com.smartlingua.messaging.dto.MessageDTO;
import com.smartlingua.messaging.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
public class WebSocketController {

    @Autowired private MessageService messageService;
    @Autowired private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload Map<String, Object> payload) {
        try {
            Long senderId = Long.valueOf(payload.get("senderId").toString());
            Long receiverId = Long.valueOf(payload.get("receiverId").toString());
            String content = payload.get("content").toString();
            MessageDTO message = messageService.sendMessage(senderId, receiverId, content);
            messagingTemplate.convertAndSend("/queue/messages/" + receiverId, message);
            messagingTemplate.convertAndSend("/queue/messages/" + senderId, message);
        } catch (Exception e) {
            // Log silently - WebSocket errors shouldn't crash the server
        }
    }

    @MessageMapping("/chat.markAsRead")
    public void markAsRead(@Payload Map<String, Object> payload) {
        try {
            Long userId = Long.valueOf(payload.get("userId").toString());
            Long conversationId = Long.valueOf(payload.get("conversationId").toString());
            messageService.markMessagesAsRead(userId, conversationId);
            messagingTemplate.convertAndSend("/topic/conversation/" + conversationId + "/read",
                    Map.of("userId", userId, "conversationId", conversationId));
        } catch (Exception e) {
            // Log silently
        }
    }
}
