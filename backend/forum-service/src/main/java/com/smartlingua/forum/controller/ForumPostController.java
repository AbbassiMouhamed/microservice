package com.smartlingua.forum.controller;

import com.smartlingua.forum.domain.PostStatus;
import com.smartlingua.forum.dto.*;
import com.smartlingua.forum.service.ForumPostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/forum/posts")
@Tag(name = "Forum Posts", description = "Create, read, update, delete, like, report and moderate forum posts")
public class ForumPostController {

    private final ForumPostService postService;

    public ForumPostController(ForumPostService postService) {
        this.postService = postService;
    }

    @PostMapping
    @Operation(summary = "Create a new forum post")
    public ResponseEntity<ForumPostResponse> create(@Valid @RequestBody ForumPostRequest req,
                                                     @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.status(HttpStatus.CREATED).body(postService.create(req, jwt));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a forum post by ID")
    public ForumPostResponse getById(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        return postService.getById(id, jwt);
    }

    @GetMapping
    @Operation(summary = "List all forum posts with pagination")
    public List<ForumPostResponse> getAll(@RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "20") int size,
                                           @AuthenticationPrincipal Jwt jwt) {
        return postService.getAll(page, size, jwt);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a forum post")
    public ForumPostResponse update(@PathVariable Long id, @Valid @RequestBody ForumPostRequest req,
                                     @AuthenticationPrincipal Jwt jwt) {
        return postService.update(id, req, jwt);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a forum post")
    public void delete(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        postService.delete(id, jwt);
    }

    @GetMapping("/trending")
    @Operation(summary = "Get trending forum posts")
    public List<ForumPostResponse> getTrending(@RequestParam(defaultValue = "10") int limit,
                                                @AuthenticationPrincipal Jwt jwt) {
        return postService.getTrending(limit, jwt);
    }

    @GetMapping("/recommendations")
    @Operation(summary = "Get recommended posts by category")
    public List<ForumPostResponse> getRecommendations(@RequestParam String category,
                                                       @RequestParam(defaultValue = "10") int limit,
                                                       @AuthenticationPrincipal Jwt jwt) {
        return postService.getRecommendations(category, limit, jwt);
    }

    @GetMapping("/flagged")
    @Operation(summary = "Get flagged/reported posts")
    public List<ForumPostResponse> getFlagged(@AuthenticationPrincipal Jwt jwt) {
        return postService.getFlagged(jwt);
    }

    @PutMapping("/{id}/moderate")
    @Operation(summary = "Moderate a forum post")
    public ForumPostResponse moderate(@PathVariable Long id,
                                       @RequestBody Map<String, Object> body) {
        boolean moderated = Boolean.parseBoolean(String.valueOf(body.getOrDefault("moderated", true)));
        PostStatus status = PostStatus.valueOf(String.valueOf(body.getOrDefault("status", "ACTIVE")));
        return postService.moderate(id, moderated, status);
    }

    @PostMapping("/{id}/like")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Like a forum post")
    public void like(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        postService.like(id, jwt);
    }

    @DeleteMapping("/{id}/like")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Unlike a forum post")
    public void unlike(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        postService.unlike(id, jwt);
    }

    @PostMapping("/{id}/report")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Report a forum post")
    public void report(@PathVariable Long id, @Valid @RequestBody ReportRequest req,
                       @AuthenticationPrincipal Jwt jwt) {
        postService.report(id, req, jwt);
    }
}
