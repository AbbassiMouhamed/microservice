package com.smartlingua.messaging.controller;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
public class CallSignalController {

    private final SimpMessagingTemplate messagingTemplate;

    public CallSignalController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/call.offer/{receiverId}")
    public void sendOffer(@DestinationVariable Long receiverId, @Payload Map<String, Object> payload) {
        messagingTemplate.convertAndSend("/queue/call-offer/" + receiverId, payload);
    }

    @MessageMapping("/call.answer/{receiverId}")
    public void sendAnswer(@DestinationVariable Long receiverId, @Payload Map<String, Object> payload) {
        messagingTemplate.convertAndSend("/queue/call-answer/" + receiverId, payload);
    }

    @MessageMapping("/call.ice-candidate/{receiverId}")
    public void sendIceCandidate(@DestinationVariable Long receiverId, @Payload Map<String, Object> payload) {
        messagingTemplate.convertAndSend("/queue/call-ice-candidate/" + receiverId, payload);
    }

    @MessageMapping("/call.end/{receiverId}")
    public void endCall(@DestinationVariable Long receiverId, @Payload Map<String, Object> payload) {
        messagingTemplate.convertAndSend("/queue/call-end/" + receiverId, payload);
    }
}
