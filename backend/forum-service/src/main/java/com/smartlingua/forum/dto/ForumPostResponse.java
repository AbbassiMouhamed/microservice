package com.smartlingua.forum.dto;

import com.smartlingua.forum.domain.PostStatus;

import java.time.Instant;
import java.util.List;

public record ForumPostResponse(
        Long id,
        String title,
        String content,
        String authorId,
        String authorName,
        String category,
        boolean moderated,
        PostStatus status,
        Instant createdAt,
        Instant updatedAt,
        long likesCount,
        boolean userLiked,
        boolean trending,
        long commentsCount
) {}
