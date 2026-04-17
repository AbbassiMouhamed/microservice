package com.smartlingua.forum.dto;

import com.smartlingua.forum.domain.NotificationPriority;
import com.smartlingua.forum.domain.NotificationType;

import java.time.Instant;

public record NotificationResponse(
        Long id,
        String userId,
        String title,
        String message,
        NotificationType type,
        boolean read,
        String sourceType,
        Long sourceId,
        NotificationPriority priority,
        String actionUrl,
        Instant createdAt
) {}
