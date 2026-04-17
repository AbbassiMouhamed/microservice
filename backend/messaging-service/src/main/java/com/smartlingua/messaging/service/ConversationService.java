package com.smartlingua.messaging.service;

import com.smartlingua.messaging.dto.ConversationDTO;
import com.smartlingua.messaging.dto.MessageDTO;
import com.smartlingua.messaging.entity.Conversation;
import com.smartlingua.messaging.entity.Message;
import com.smartlingua.messaging.repository.ConversationRepository;
import com.smartlingua.messaging.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ConversationService {

    @Autowired private ConversationRepository conversationRepository;
    @Autowired private MessageRepository messageRepository;

    public List<ConversationDTO> getUserConversations(Long userId) {
        return conversationRepository.findConversationsByUserId(userId).stream()
                .map(c -> convertToDTO(c, userId))
                .collect(Collectors.toList());
    }

    public ConversationDTO getConversationById(Long conversationId, Long userId) {
        Conversation c = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found: " + conversationId));
        return convertToDTO(c, userId);
    }

    public ConversationDTO getConversationBetweenUsers(Long userId1, Long userId2) {
        Conversation c = conversationRepository.findConversationBetweenUsers(userId1, userId2)
                .orElseThrow(() -> new RuntimeException("No conversation between " + userId1 + " and " + userId2));
        return convertToDTO(c, userId1);
    }

    private ConversationDTO convertToDTO(Conversation conversation, Long currentUserId) {
        ConversationDTO dto = new ConversationDTO();
        dto.setId(conversation.getId());
        dto.setParticipant1Id(conversation.getParticipant1Id());
        dto.setParticipant2Id(conversation.getParticipant2Id());
        dto.setCreatedAt(conversation.getCreatedAt());
        dto.setUpdatedAt(conversation.getUpdatedAt());

        List<Message> messages = conversation.getMessages();
        if (messages != null && !messages.isEmpty()) {
            dto.setMessages(messages.stream().map(m -> {
                MessageDTO mdto = new MessageDTO();
                mdto.setId(m.getId());
                mdto.setSenderId(m.getSenderId());
                mdto.setReceiverId(m.getReceiverId());
                mdto.setContent(m.getContent());
                mdto.setTimestamp(m.getTimestamp());
                mdto.setIsRead(m.isRead());
                mdto.setConversationId(conversation.getId());
                return mdto;
            }).collect(Collectors.toList()));

            Message lastMsg = messages.get(messages.size() - 1);
            dto.setLastMessagePreview(lastMsg.getContent() != null && lastMsg.getContent().length() > 50
                    ? lastMsg.getContent().substring(0, 50) + "..." : lastMsg.getContent());
            dto.setLastMessageAt(lastMsg.getTimestamp());
        }

        Long unread = messageRepository.countByConversationIdAndReceiverIdAndIsReadFalse(conversation.getId(), currentUserId);
        dto.setUnreadCount(unread);
        return dto;
    }
}
