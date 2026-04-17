package com.smartlingua.forum.controller;

import com.smartlingua.forum.dto.*;
import com.smartlingua.forum.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/forum/posts/{postId}/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping
    public ResponseEntity<CommentResponse> create(@PathVariable Long postId,
                                                    @Valid @RequestBody CommentRequest req,
                                                    @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.status(HttpStatus.CREATED).body(commentService.create(postId, req, jwt));
    }

    @GetMapping
    public List<CommentResponse> getByPost(@PathVariable Long postId) {
        return commentService.getByPost(postId);
    }

    @PutMapping("/{commentId}")
    public CommentResponse update(@PathVariable Long postId, @PathVariable Long commentId,
                                   @RequestBody Map<String, String> body,
                                   @AuthenticationPrincipal Jwt jwt) {
        return commentService.update(commentId, body.get("content"), jwt);
    }

    @DeleteMapping("/{commentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long postId, @PathVariable Long commentId,
                       @AuthenticationPrincipal Jwt jwt) {
        commentService.delete(commentId, jwt);
    }
}
