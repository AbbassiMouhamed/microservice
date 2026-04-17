package com.smartlingua.messaging.controller;

import com.smartlingua.messaging.dto.CreateInvitationRequest;
import com.smartlingua.messaging.dto.InvitationDTO;
import com.smartlingua.messaging.service.InvitationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messaging/invitations")
public class InvitationController {

    @Autowired private InvitationService invitationService;
    @Autowired private SimpMessagingTemplate messagingTemplate;

    @PostMapping("/create")
    public ResponseEntity<?> createInvitation(@RequestBody CreateInvitationRequest request) {
        try {
            InvitationDTO inv = invitationService.createInvitation(
                    request.getSenderId(), request.getReceiverId(), request.getMessage(), request.getInvitationType());
            messagingTemplate.convertAndSend("/queue/invitation-received/" + inv.getReceiverId(), inv);
            return ResponseEntity.status(HttpStatus.CREATED).body(inv);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/received/{userId}")
    public ResponseEntity<List<InvitationDTO>> getReceivedInvitations(@PathVariable Long userId) {
        return ResponseEntity.ok(invitationService.getReceivedInvitations(userId));
    }

    @GetMapping("/sent/{userId}")
    public ResponseEntity<List<InvitationDTO>> getSentInvitations(@PathVariable Long userId) {
        return ResponseEntity.ok(invitationService.getSentInvitations(userId));
    }

    @GetMapping("/pending/{userId}")
    public ResponseEntity<List<InvitationDTO>> getPendingInvitations(@PathVariable Long userId) {
        return ResponseEntity.ok(invitationService.getPendingInvitations(userId));
    }

    @PutMapping("/{invitationId}/accept")
    public ResponseEntity<?> acceptInvitation(@PathVariable Long invitationId) {
        try {
            InvitationDTO inv = invitationService.acceptInvitation(invitationId);
            Map<String, Object> payload = new HashMap<>();
            payload.put("invitationId", inv.getId());
            payload.put("status", inv.getStatus());
            payload.put("receiverId", inv.getReceiverId());
            messagingTemplate.convertAndSend("/queue/invitation-accepted/" + inv.getSenderId(), payload);
            return ResponseEntity.ok(inv);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{invitationId}/reject")
    public ResponseEntity<?> rejectInvitation(@PathVariable Long invitationId) {
        try {
            InvitationDTO inv = invitationService.rejectInvitation(invitationId);
            Map<String, Object> payload = new HashMap<>();
            payload.put("invitationId", inv.getId());
            payload.put("status", inv.getStatus());
            payload.put("receiverId", inv.getReceiverId());
            messagingTemplate.convertAndSend("/queue/invitation-rejected/" + inv.getSenderId(), payload);
            return ResponseEntity.ok(inv);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/pending-count/{userId}")
    public ResponseEntity<Long> getPendingCount(@PathVariable Long userId) {
        return ResponseEntity.ok(invitationService.countPendingInvitations(userId));
    }
}
