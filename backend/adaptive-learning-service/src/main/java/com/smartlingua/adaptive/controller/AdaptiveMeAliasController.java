package com.smartlingua.adaptive.controller;

import com.smartlingua.adaptive.dto.AdaptiveDtos.*;
import com.smartlingua.adaptive.security.JwtUserResolver;
import com.smartlingua.adaptive.service.AdaptiveLearningFacadeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/adaptive/me")
public class AdaptiveMeAliasController {

    private final AdaptiveLearningFacadeService facade;
    private final JwtUserResolver jwtUserResolver;

    public AdaptiveMeAliasController(AdaptiveLearningFacadeService facade,
                                     JwtUserResolver jwtUserResolver) {
        this.facade = facade;
        this.jwtUserResolver = jwtUserResolver;
    }

    @PostMapping("/placement-test")
    public ResponseEntity<PlacementTestSubmitResponse> submitPlacementTest(
            Authentication auth, @RequestBody PlacementTestSubmitRequest req) {
        long studentId = jwtUserResolver.requireAppUserId(auth);
        return ResponseEntity.ok(facade.submitPlacementTest(studentId, req));
    }

    @PostMapping("/learning-path")
    public ResponseEntity<LearningPathView> generateLearningPath(
            Authentication auth, @RequestBody GenerateLearningPathRequest req) {
        long studentId = jwtUserResolver.requireAppUserId(auth);
        return ResponseEntity.ok(facade.generateLearningPath(studentId, req));
    }

    @GetMapping("/learning-path")
    public ResponseEntity<LearningPathView> getMyLearningPath(Authentication auth) {
        long studentId = jwtUserResolver.requireAppUserId(auth);
        return ResponseEntity.ok(facade.getLatestLearningPath(studentId));
    }

    @GetMapping("/profile")
    public ResponseEntity<ProfileView> getMyProfile(Authentication auth) {
        long studentId = jwtUserResolver.requireAppUserId(auth);
        return ResponseEntity.ok(facade.getProfile(studentId));
    }

    @GetMapping("/progress")
    public ResponseEntity<ProgressView> getMyProgress(Authentication auth) {
        long studentId = jwtUserResolver.requireAppUserId(auth);
        return ResponseEntity.ok(facade.getProgress(studentId));
    }

    @GetMapping("/recommendations")
    public ResponseEntity<List<RecommendationView>> getMyRecommendations(Authentication auth) {
        long studentId = jwtUserResolver.requireAppUserId(auth);
        return ResponseEntity.ok(facade.getRecommendations(studentId));
    }
}
