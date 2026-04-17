package com.smartlingua.forum.service;

import com.smartlingua.forum.domain.*;
import com.smartlingua.forum.dto.*;
import com.smartlingua.forum.repository.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ForumPostService {

    private final ForumPostRepository postRepo;
    private final PostLikeRepository likeRepo;
    private final PostReportRepository reportRepo;
    private final CommentRepository commentRepo;
    private final NotificationService notificationService;
    private final ContentModerationService moderationService;
    private final JwtHelper jwtHelper;

    public ForumPostService(ForumPostRepository postRepo, PostLikeRepository likeRepo,
                            PostReportRepository reportRepo, CommentRepository commentRepo,
                            NotificationService notificationService,
                            ContentModerationService moderationService, JwtHelper jwtHelper) {
        this.postRepo = postRepo;
        this.likeRepo = likeRepo;
        this.reportRepo = reportRepo;
        this.commentRepo = commentRepo;
        this.notificationService = notificationService;
        this.moderationService = moderationService;
        this.jwtHelper = jwtHelper;
    }

    public ForumPostResponse create(ForumPostRequest req, Jwt jwt) {
        ForumPost post = new ForumPost();
        post.setTitle(req.title());
        post.setContent(req.content());
        post.setCategory(req.category());
        post.setAuthorId(jwtHelper.getUserId(jwt));
        post.setAuthorName(jwtHelper.getUserName(jwt));

        if (moderationService.containsBlockedContent(req.title())
                || moderationService.containsBlockedContent(req.content())) {
            post.setStatus(PostStatus.FLAGGED);
        }

        post = postRepo.save(post);
        return toResponse(post, jwt);
    }

    @Transactional(readOnly = true)
    public ForumPostResponse getById(Long id, Jwt jwt) {
        ForumPost post = postRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Post not found: " + id));
        return toResponse(post, jwt);
    }

    @Transactional(readOnly = true)
    public List<ForumPostResponse> getAll(int page, int size, Jwt jwt) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return postRepo.findByStatus(PostStatus.ACTIVE, pageable)
                .map(p -> toResponse(p, jwt))
                .toList();
    }

    public ForumPostResponse update(Long id, ForumPostRequest req, Jwt jwt) {
        ForumPost post = postRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Post not found: " + id));

        String userId = jwtHelper.getUserId(jwt);
        if (!post.getAuthorId().equals(userId) && !jwtHelper.isAdminOrTeacher(jwt)) {
            throw new SecurityException("Not authorized to update this post");
        }

        post.setTitle(req.title());
        post.setContent(req.content());
        post.setCategory(req.category());

        if (moderationService.containsBlockedContent(req.title())
                || moderationService.containsBlockedContent(req.content())) {
            post.setStatus(PostStatus.FLAGGED);
        }

        post = postRepo.save(post);
        return toResponse(post, jwt);
    }

    public void delete(Long id, Jwt jwt) {
        ForumPost post = postRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Post not found: " + id));

        String userId = jwtHelper.getUserId(jwt);
        if (!post.getAuthorId().equals(userId) && !jwtHelper.isAdminOrTeacher(jwt)) {
            throw new SecurityException("Not authorized to delete this post");
        }

        postRepo.delete(post);
    }

    @Transactional(readOnly = true)
    public List<ForumPostResponse> getTrending(int limit, Jwt jwt) {
        return postRepo.findTrending(PageRequest.of(0, limit)).stream()
                .map(p -> toResponse(p, jwt))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ForumPostResponse> getRecommendations(String category, int limit, Jwt jwt) {
        return postRepo.findRecommendations(category, PageRequest.of(0, limit)).stream()
                .map(p -> toResponse(p, jwt))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ForumPostResponse> getFlagged(Jwt jwt) {
        return postRepo.findByStatusOrderByUpdatedAtDesc(PostStatus.FLAGGED).stream()
                .map(p -> toResponse(p, jwt))
                .toList();
    }

    public ForumPostResponse moderate(Long id, boolean moderated, PostStatus status) {
        ForumPost post = postRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Post not found: " + id));
        post.setModerated(moderated);
        post.setStatus(status);
        post = postRepo.save(post);
        return toResponse(post, null);
    }

    // Like / Unlike
    public void like(Long postId, Jwt jwt) {
        String userId = jwtHelper.getUserId(jwt);
        if (likeRepo.existsByPostIdAndUserId(postId, userId)) return;

        ForumPost post = postRepo.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found: " + postId));

        PostLike like = new PostLike();
        like.setPost(post);
        like.setUserId(userId);
        likeRepo.save(like);
    }

    public void unlike(Long postId, Jwt jwt) {
        String userId = jwtHelper.getUserId(jwt);
        likeRepo.findByPostIdAndUserId(postId, userId).ifPresent(likeRepo::delete);
    }

    // Report
    public void report(Long postId, ReportRequest req, Jwt jwt) {
        ForumPost post = postRepo.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found: " + postId));

        PostReport report = new PostReport();
        report.setPost(post);
        report.setReporterId(jwtHelper.getUserId(jwt));
        report.setReason(req.reason());
        reportRepo.save(report);

        // auto-flag if 3+ reports
        if (reportRepo.countByPostId(postId) >= 3 && post.getStatus() == PostStatus.ACTIVE) {
            post.setStatus(PostStatus.FLAGGED);
            postRepo.save(post);
        }
    }

    private ForumPostResponse toResponse(ForumPost post, Jwt jwt) {
        long likesCount = likeRepo.countByPostId(post.getId());
        boolean userLiked = jwt != null && likeRepo.existsByPostIdAndUserId(post.getId(), jwtHelper.getUserId(jwt));
        long commentsCount = commentRepo.countByPostId(post.getId());
        boolean trending = likesCount >= 5;

        return new ForumPostResponse(
                post.getId(), post.getTitle(), post.getContent(),
                post.getAuthorId(), post.getAuthorName(),
                post.getCategory(), post.isModerated(), post.getStatus(),
                post.getCreatedAt(), post.getUpdatedAt(),
                likesCount, userLiked, trending, commentsCount
        );
    }
}
