package com.smartlingua.forum.service;

import com.smartlingua.forum.domain.*;
import com.smartlingua.forum.dto.NotificationResponse;
import com.smartlingua.forum.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepo;

    public NotificationService(NotificationRepository notificationRepo) {
        this.notificationRepo = notificationRepo;
    }

    public void createNotification(String userId, String title, String message,
                                   NotificationType type, String sourceType, Long sourceId) {
        Notification n = new Notification();
        n.setUserId(userId);
        n.setTitle(title);
        n.setMessage(message);
        n.setType(type);
        n.setSourceType(sourceType);
        n.setSourceId(sourceId);
        n.setPriority(NotificationPriority.MEDIUM);
        notificationRepo.save(n);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getForUser(String userId) {
        return notificationRepo.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getUnreadForUser(String userId) {
        return notificationRepo.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public long countUnread(String userId) {
        return notificationRepo.countByUserIdAndReadFalse(userId);
    }

    public void markAsRead(Long id) {
        notificationRepo.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepo.save(n);
        });
    }

    public void markAllAsRead(String userId) {
        notificationRepo.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId)
                .forEach(n -> {
                    n.setRead(true);
                    notificationRepo.save(n);
                });
    }

    private NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(
                n.getId(), n.getUserId(), n.getTitle(), n.getMessage(),
                n.getType(), n.isRead(), n.getSourceType(), n.getSourceId(),
                n.getPriority(), n.getActionUrl(), n.getCreatedAt()
        );
    }
}
