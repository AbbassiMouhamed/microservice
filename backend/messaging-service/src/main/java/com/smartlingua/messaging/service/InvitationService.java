package com.smartlingua.messaging.service;

import com.smartlingua.messaging.dto.InvitationDTO;
import com.smartlingua.messaging.entity.Conversation;
import com.smartlingua.messaging.entity.Invitation;
import com.smartlingua.messaging.repository.ConversationRepository;
import com.smartlingua.messaging.repository.InvitationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class InvitationService {

    @Autowired private InvitationRepository invitationRepository;
    @Autowired private ConversationRepository conversationRepository;

    public InvitationDTO createInvitation(Long senderId, Long receiverId, String message, String invitationType) {
        if (senderId.equals(receiverId)) throw new RuntimeException("Cannot invite yourself.");
        boolean existing = !invitationRepository.findPendingBySenderAndReceiver(senderId, receiverId).isEmpty();
        if (existing) throw new RuntimeException("Pending invitation already exists.");
        boolean conversationExists = conversationRepository.findConversationBetweenUsers(senderId, receiverId).isPresent();
        if (conversationExists) throw new RuntimeException("Conversation already exists between these users.");

        Invitation inv = new Invitation();
        inv.setSenderId(senderId);
        inv.setReceiverId(receiverId);
        inv.setMessage(message);
        inv.setInvitationType(invitationType != null ? invitationType : "CHAT");
        inv.setStatus("PENDING");
        inv = invitationRepository.save(inv);
        return convertToDTO(inv);
    }

    @Transactional(readOnly = true)
    public List<InvitationDTO> getReceivedInvitations(Long userId) {
        return invitationRepository.findByReceiverIdOrderByCreatedAtDesc(userId).stream()
                .map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InvitationDTO> getSentInvitations(Long userId) {
        return invitationRepository.findBySenderIdOrderByCreatedAtDesc(userId).stream()
                .map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InvitationDTO> getPendingInvitations(Long userId) {
        return invitationRepository.findByReceiverIdAndStatusOrderByCreatedAtDesc(userId, "PENDING").stream()
                .map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Long countPendingInvitations(Long userId) {
        return invitationRepository.countPendingInvitations(userId);
    }

    public InvitationDTO acceptInvitation(Long invitationId) {
        Invitation inv = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new RuntimeException("Invitation not found: " + invitationId));
        if (!"PENDING".equals(inv.getStatus())) throw new RuntimeException("Invitation is not pending.");
        inv.setStatus("ACCEPTED");
        inv.setRespondedAt(LocalDateTime.now());
        invitationRepository.save(inv);

        if (conversationRepository.findConversationBetweenUsers(inv.getSenderId(), inv.getReceiverId()).isEmpty()) {
            Conversation c = new Conversation(inv.getSenderId(), inv.getReceiverId());
            conversationRepository.save(c);
        }
        return convertToDTO(inv);
    }

    public InvitationDTO rejectInvitation(Long invitationId) {
        Invitation inv = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new RuntimeException("Invitation not found: " + invitationId));
        if (!"PENDING".equals(inv.getStatus())) throw new RuntimeException("Invitation is not pending.");
        inv.setStatus("REJECTED");
        inv.setRespondedAt(LocalDateTime.now());
        invitationRepository.save(inv);
        return convertToDTO(inv);
    }

    private InvitationDTO convertToDTO(Invitation inv) {
        InvitationDTO dto = new InvitationDTO();
        dto.setId(inv.getId());
        dto.setSenderId(inv.getSenderId());
        dto.setReceiverId(inv.getReceiverId());
        dto.setMessage(inv.getMessage());
        dto.setInvitationType(inv.getInvitationType());
        dto.setStatus(inv.getStatus());
        dto.setCreatedAt(inv.getCreatedAt());
        dto.setRespondedAt(inv.getRespondedAt());
        return dto;
    }
}
