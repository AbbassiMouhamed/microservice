package com.smartlingua.adaptive.controller;

import com.smartlingua.adaptive.dto.AdaptiveDtos.*;
import com.smartlingua.adaptive.security.JwtUserResolver;
import com.smartlingua.adaptive.service.AdaptiveLearningFacadeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/adaptive/me")
@Tag(name = "Adaptive Learning (Me Alias)", description = "Shorthand /me endpoints for adaptive learning")
public class AdaptiveMeAliasController {

    private final AdaptiveLearningFacadeService facade;
    private final JwtUserResolver jwtUserResolver;

    public AdaptiveMeAliasController(AdaptiveLearningFacadeService facade,
                                     JwtUserResolver jwtUserResolver) {
        this.facade = facade;
        this.jwtUserResolver = jwtUserResolver;
    }

    @Operation(summary = "Submit placement test", description = "Submit placement test answers (alias)")
    @PostMapping("/placement-test")
    public ResponseEntity<PlacementTestSubmitResponse> submitPlacementTest(
            Authentication auth, @RequestBody PlacementTestSubmitRequest req) {
        long studentId = jwtUserResolver.requireAppUserId(auth);
        return ResponseEntity.ok(facade.submitPlacementTest(studentId, req));
    }

    @Operation(summary = "Generate learning path", description = "Generate a personalized learning path (alias)")
    @PostMapping("/learning-path")
    public ResponseEntity<LearningPathView> generateLearningPath(
            Authentication auth, @RequestBody GenerateLearningPathRequest req) {
        long studentId = jwtUserResolver.requireAppUserId(auth);
        return ResponseEntity.ok(facade.generateLearningPath(studentId, req));
    }

    @Operation(summary = "Get my learning path", description = "Retrieve the latest learning path (alias)")
    @GetMapping("/learning-path")
    public ResponseEntity<LearningPathView> getMyLearningPath(Authentication auth) {
        long studentId = jwtUserResolver.requireAppUserId(auth);
        return ResponseEntity.ok(facade.getLatestLearningPath(studentId));
    }

    @Operation(summary = "Get my profile", description = "Retrieve the adaptive learning profile (alias)")
    @GetMapping("/profile")
    public ResponseEntity<ProfileView> getMyProfile(Authentication auth) {
        long studentId = jwtUserResolver.requireAppUserId(auth);
        return ResponseEntity.ok(facade.getProfile(studentId));
    }

    @Operation(summary = "Get my progress", description = "Retrieve learning progress (alias)")
    @GetMapping("/progress")
    public ResponseEntity<ProgressView> getMyProgress(Authentication auth) {
        long studentId = jwtUserResolver.requireAppUserId(auth);
        return ResponseEntity.ok(facade.getProgress(studentId));
    }

    @Operation(summary = "Get my recommendations", description = "Retrieve personalized recommendations (alias)")
    @GetMapping("/recommendations")
    public ResponseEntity<List<RecommendationView>> getMyRecommendations(Authentication auth) {
        long studentId = jwtUserResolver.requireAppUserId(auth);
        return ResponseEntity.ok(facade.getRecommendations(studentId));
    }
}
