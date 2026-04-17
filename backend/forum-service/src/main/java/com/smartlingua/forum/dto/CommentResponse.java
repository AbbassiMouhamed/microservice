package com.smartlingua.forum.dto;

import java.time.Instant;
import java.util.List;

public record CommentResponse(
        Long id,
        String content,
        Long postId,
        String authorId,
        String authorName,
        Long parentCommentId,
        boolean moderated,
        Instant createdAt,
        Instant updatedAt,
        List<CommentResponse> replies
) {}
