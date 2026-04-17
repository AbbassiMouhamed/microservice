package com.smartlingua.forum.controller;

import com.smartlingua.forum.dto.*;
import com.smartlingua.forum.service.CommentService;
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
@RequestMapping("/api/forum/posts/{postId}/comments")
@Tag(name = "Comments", description = "Manage comments on forum posts")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping
    @Operation(summary = "Create a comment on a post")
    public ResponseEntity<CommentResponse> create(@PathVariable Long postId,
                                                    @Valid @RequestBody CommentRequest req,
                                                    @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.status(HttpStatus.CREATED).body(commentService.create(postId, req, jwt));
    }

    @GetMapping
    @Operation(summary = "List comments for a post")
    public List<CommentResponse> getByPost(@PathVariable Long postId) {
        return commentService.getByPost(postId);
    }

    @PutMapping("/{commentId}")
    @Operation(summary = "Update a comment")
    public CommentResponse update(@PathVariable Long postId, @PathVariable Long commentId,
                                   @RequestBody Map<String, String> body,
                                   @AuthenticationPrincipal Jwt jwt) {
        return commentService.update(commentId, body.get("content"), jwt);
    }

    @DeleteMapping("/{commentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a comment")
    public void delete(@PathVariable Long postId, @PathVariable Long commentId,
                       @AuthenticationPrincipal Jwt jwt) {
        commentService.delete(commentId, jwt);
    }
}
