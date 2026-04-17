package com.smartlingua.forum.controller;

import com.smartlingua.forum.domain.PostStatus;
import com.smartlingua.forum.dto.*;
import com.smartlingua.forum.service.ForumPostService;
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
public class ForumPostController {

    private final ForumPostService postService;

    public ForumPostController(ForumPostService postService) {
        this.postService = postService;
    }

    @PostMapping
    public ResponseEntity<ForumPostResponse> create(@Valid @RequestBody ForumPostRequest req,
                                                     @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.status(HttpStatus.CREATED).body(postService.create(req, jwt));
    }

    @GetMapping("/{id}")
    public ForumPostResponse getById(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        return postService.getById(id, jwt);
    }

    @GetMapping
    public List<ForumPostResponse> getAll(@RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "20") int size,
                                           @AuthenticationPrincipal Jwt jwt) {
        return postService.getAll(page, size, jwt);
    }

    @PutMapping("/{id}")
    public ForumPostResponse update(@PathVariable Long id, @Valid @RequestBody ForumPostRequest req,
                                     @AuthenticationPrincipal Jwt jwt) {
        return postService.update(id, req, jwt);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        postService.delete(id, jwt);
    }

    @GetMapping("/trending")
    public List<ForumPostResponse> getTrending(@RequestParam(defaultValue = "10") int limit,
                                                @AuthenticationPrincipal Jwt jwt) {
        return postService.getTrending(limit, jwt);
    }

    @GetMapping("/recommendations")
    public List<ForumPostResponse> getRecommendations(@RequestParam String category,
                                                       @RequestParam(defaultValue = "10") int limit,
                                                       @AuthenticationPrincipal Jwt jwt) {
        return postService.getRecommendations(category, limit, jwt);
    }

    @GetMapping("/flagged")
    public List<ForumPostResponse> getFlagged(@AuthenticationPrincipal Jwt jwt) {
        return postService.getFlagged(jwt);
    }

    @PutMapping("/{id}/moderate")
    public ForumPostResponse moderate(@PathVariable Long id,
                                       @RequestBody Map<String, Object> body) {
        boolean moderated = Boolean.parseBoolean(String.valueOf(body.getOrDefault("moderated", true)));
        PostStatus status = PostStatus.valueOf(String.valueOf(body.getOrDefault("status", "ACTIVE")));
        return postService.moderate(id, moderated, status);
    }

    @PostMapping("/{id}/like")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void like(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        postService.like(id, jwt);
    }

    @DeleteMapping("/{id}/like")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unlike(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        postService.unlike(id, jwt);
    }

    @PostMapping("/{id}/report")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void report(@PathVariable Long id, @Valid @RequestBody ReportRequest req,
                       @AuthenticationPrincipal Jwt jwt) {
        postService.report(id, req, jwt);
    }
}
