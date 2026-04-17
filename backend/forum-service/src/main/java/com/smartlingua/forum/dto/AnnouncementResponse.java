package com.smartlingua.forum.dto;

import java.time.Instant;

public record AnnouncementResponse(
        Long id,
        String title,
        String content,
        String authorId,
        String authorName,
        Instant publishedAt,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {}
