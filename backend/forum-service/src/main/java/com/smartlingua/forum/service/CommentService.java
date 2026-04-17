package com.smartlingua.forum.service;

import com.smartlingua.forum.domain.*;
import com.smartlingua.forum.dto.*;
import com.smartlingua.forum.repository.*;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CommentService {

    private final CommentRepository commentRepo;
    private final ForumPostRepository postRepo;
    private final NotificationService notificationService;
    private final ContentModerationService moderationService;
    private final JwtHelper jwtHelper;

    public CommentService(CommentRepository commentRepo, ForumPostRepository postRepo,
                          NotificationService notificationService,
                          ContentModerationService moderationService, JwtHelper jwtHelper) {
        this.commentRepo = commentRepo;
        this.postRepo = postRepo;
        this.notificationService = notificationService;
        this.moderationService = moderationService;
        this.jwtHelper = jwtHelper;
    }

    public CommentResponse create(Long postId, CommentRequest req, Jwt jwt) {
        ForumPost post = postRepo.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found: " + postId));

        Comment comment = new Comment();
        comment.setContent(req.content());
        comment.setPost(post);
        comment.setAuthorId(jwtHelper.getUserId(jwt));
        comment.setAuthorName(jwtHelper.getUserName(jwt));

        if (moderationService.containsBlockedContent(req.content())) {
            comment.setModerated(true);
        }

        if (req.parentCommentId() != null) {
            Comment parent = commentRepo.findById(req.parentCommentId())
                    .orElseThrow(() -> new IllegalArgumentException("Parent comment not found"));
            comment.setParentComment(parent);

            // notify parent comment author of reply
            notificationService.createNotification(
                    parent.getAuthorId(),
                    "New reply to your comment",
                    jwtHelper.getUserName(jwt) + " replied to your comment",
                    NotificationType.REPLY,
                    "COMMENT", parent.getId()
            );
        } else {
            // notify post author of new comment
            if (!post.getAuthorId().equals(jwtHelper.getUserId(jwt))) {
                notificationService.createNotification(
                        post.getAuthorId(),
                        "New comment on your post",
                        jwtHelper.getUserName(jwt) + " commented on \"" + post.getTitle() + "\"",
                        NotificationType.COMMENT,
                        "POST", post.getId()
                );
            }
        }

        comment = commentRepo.save(comment);
        return toResponse(comment);
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getByPost(Long postId) {
        return commentRepo.findByPostIdAndParentCommentIsNullOrderByCreatedAtAsc(postId).stream()
                .map(this::toResponse)
                .toList();
    }

    public CommentResponse update(Long commentId, String content, Jwt jwt) {
        Comment comment = commentRepo.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found: " + commentId));

        if (!comment.getAuthorId().equals(jwtHelper.getUserId(jwt)) && !jwtHelper.isAdminOrTeacher(jwt)) {
            throw new SecurityException("Not authorized");
        }

        comment.setContent(content);
        if (moderationService.containsBlockedContent(content)) {
            comment.setModerated(true);
        }

        comment = commentRepo.save(comment);
        return toResponse(comment);
    }

    public void delete(Long commentId, Jwt jwt) {
        Comment comment = commentRepo.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found: " + commentId));

        if (!comment.getAuthorId().equals(jwtHelper.getUserId(jwt)) && !jwtHelper.isAdminOrTeacher(jwt)) {
            throw new SecurityException("Not authorized");
        }

        commentRepo.delete(comment);
    }

    private CommentResponse toResponse(Comment c) {
        List<CommentResponse> replies = c.getReplies().stream()
                .map(this::toResponse)
                .toList();

        return new CommentResponse(
                c.getId(), c.getContent(), c.getPost().getId(),
                c.getAuthorId(), c.getAuthorName(),
                c.getParentComment() != null ? c.getParentComment().getId() : null,
                c.isModerated(), c.getCreatedAt(), c.getUpdatedAt(), replies
        );
    }
}
