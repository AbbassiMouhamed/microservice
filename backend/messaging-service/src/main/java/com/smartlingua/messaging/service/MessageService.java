package com.smartlingua.messaging.service;

import com.smartlingua.messaging.dto.MessageDTO;
import com.smartlingua.messaging.entity.Conversation;
import com.smartlingua.messaging.entity.Message;
import com.smartlingua.messaging.repository.ConversationRepository;
import com.smartlingua.messaging.repository.MessageRepository;
import com.smartlingua.messaging.service.BadWordService.FilterResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@Transactional
public class MessageService {

    private static final Logger log = LoggerFactory.getLogger(MessageService.class);

    @Autowired private MessageRepository messageRepository;
    @Autowired private ConversationRepository conversationRepository;
    @Autowired private BlockService blockService;
    @Autowired private BadWordService badWordService;

    public MessageDTO sendMessage(Long senderId, Long receiverId, String content) {
        if (badWordService.isBanned(senderId)) {
            LocalDateTime until = badWordService.getBannedUntil(senderId);
            String untilStr = until == null ? "" : until.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm", Locale.FRANCE));
            throw new RuntimeException("You are banned until " + untilStr);
        }
        if (blockService.isBlocked(receiverId, senderId)) {
            throw new RuntimeException("You cannot send messages to this user.");
        }
        Conversation conversation = conversationRepository
                .findConversationBetweenUsers(senderId, receiverId)
                .orElseGet(() -> conversationRepository.save(new Conversation(senderId, receiverId)));

        String contentToSave = content;
        boolean hadBadWord = false;
        if (content != null && !content.startsWith("data:")) {
            FilterResult filtered = badWordService.filterContent(content);
            contentToSave = filtered.getContent();
            hadBadWord = filtered.hadBadWord();
            if (hadBadWord) log.info("Message contained bad word: senderId={}", senderId);
        }
        if (hadBadWord) badWordService.banUser(senderId);

        Message message = new Message(senderId, receiverId, contentToSave);
        conversation.addMessage(message);
        message = messageRepository.save(message);
        return convertToDTO(message);
    }

    public MessageDTO sendMessageToConversation(Long conversationId, Long senderId, String content) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        // Verify sender is a participant
        if (!conversation.getParticipant1Id().equals(senderId) && !conversation.getParticipant2Id().equals(senderId)) {
            throw new RuntimeException("User is not a participant of this conversation");
        }

        Long receiverId = conversation.getParticipant1Id().equals(senderId)
                ? conversation.getParticipant2Id()
                : conversation.getParticipant1Id();

        return sendMessage(senderId, receiverId, content);
    }

    public List<MessageDTO> getConversationMessages(Long conversationId) {
        return messageRepository.findByConversationIdOrderByTimestampAsc(conversationId).stream()
                .map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<MessageDTO> getMessagesBetweenUsers(Long userId1, Long userId2) {
        return messageRepository.findMessagesBetweenUsers(userId1, userId2).stream()
                .map(this::convertToDTO).collect(Collectors.toList());
    }

    public void markMessagesAsRead(Long userId, Long conversationId) {
        List<Message> unread = messageRepository.findByConversationIdOrderByTimestampAsc(conversationId).stream()
                .filter(m -> m.getReceiverId().equals(userId) && !m.isRead())
                .collect(Collectors.toList());
        unread.forEach(m -> m.setRead(true));
        messageRepository.saveAll(unread);
    }

    public Long countUnreadMessages(Long userId) {
        return messageRepository.countUnreadMessages(userId);
    }

    public List<MessageDTO> getUnreadMessages(Long userId) {
        return messageRepository.findByReceiverIdAndIsReadFalseOrderByTimestampDesc(userId).stream()
                .map(this::convertToDTO).collect(Collectors.toList());
    }

    private MessageDTO convertToDTO(Message message) {
        MessageDTO dto = new MessageDTO();
        dto.setId(message.getId());
        dto.setSenderId(message.getSenderId());
        dto.setReceiverId(message.getReceiverId());
        dto.setContent(message.getContent());
        dto.setTimestamp(message.getTimestamp());
        dto.setIsRead(message.isRead());
        if (message.getConversation() != null) dto.setConversationId(message.getConversation().getId());
        return dto;
    }
}
