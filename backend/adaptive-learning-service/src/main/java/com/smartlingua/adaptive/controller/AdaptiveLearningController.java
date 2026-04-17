package com.smartlingua.adaptive.controller;

import com.smartlingua.adaptive.dto.AdaptiveDtos.*;
import com.smartlingua.adaptive.security.JwtUserResolver;
import com.smartlingua.adaptive.service.AdaptiveLearningFacadeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/adaptive")
public class AdaptiveLearningController {

    private final AdaptiveLearningFacadeService facade;
    private final JwtUserResolver jwtUserResolver;

    public AdaptiveLearningController(AdaptiveLearningFacadeService facade,
                                      JwtUserResolver jwtUserResolver) {
        this.facade = facade;
        this.jwtUserResolver = jwtUserResolver;
    }

    // ── /me/* endpoints (current user) ──────────────────────────

    @PostMapping("/me/placement-test")
    public ResponseEntity<PlacementTestSubmitResponse> submitPlacementTest(
            Authentication auth, @RequestBody PlacementTestSubmitRequest req) {
        long studentId = jwtUserResolver.requireAppUserId(auth);
        return ResponseEntity.ok(facade.submitPlacementTest(studentId, req));
    }

    @PostMapping("/me/learning-path")
    public ResponseEntity<LearningPathView> generateLearningPath(
            Authentication auth, @RequestBody GenerateLearningPathRequest req) {
        long studentId = jwtUserResolver.requireAppUserId(auth);
        return ResponseEntity.ok(facade.generateLearningPath(studentId, req));
    }

    @GetMapping("/me/learning-path")
    public ResponseEntity<LearningPathView> getMyLearningPath(Authentication auth) {
        long studentId = jwtUserResolver.requireAppUserId(auth);
        return ResponseEntity.ok(facade.getLatestLearningPath(studentId));
    }

    @PutMapping("/me/learning-path/items/{itemId}/status")
    public ResponseEntity<LearningPathItemView> updateItemStatus(
            Authentication auth, @PathVariable Long itemId,
            @RequestBody UpdateItemStatusRequest req) {
        long studentId = jwtUserResolver.requireAppUserId(auth);
        return ResponseEntity.ok(facade.updateItemStatus(studentId, itemId, req));
    }

    @PostMapping("/me/level-test")
    public ResponseEntity<LevelTestSubmitResponse> submitLevelTest(
            Authentication auth, @RequestBody LevelTestSubmitRequest req) {
        long studentId = jwtUserResolver.requireAppUserId(auth);
        return ResponseEntity.ok(facade.submitLevelTest(studentId, req));
    }

    @PostMapping("/me/level-test/from-quiz")
    public ResponseEntity<LevelTestSubmitResponse> submitLevelTestFromQuiz(
            Authentication auth, @RequestBody MeLevelTestFromQuizRequest req) {
        long studentId = jwtUserResolver.requireAppUserId(auth);
        return ResponseEntity.ok(facade.submitLevelTestFromQuiz(studentId, req));
    }

    @GetMapping("/me/profile")
    public ResponseEntity<ProfileView> getMyProfile(Authentication auth) {
        long studentId = jwtUserResolver.requireAppUserId(auth);
        return ResponseEntity.ok(facade.getProfile(studentId));
    }

    @GetMapping("/me/progress")
    public ResponseEntity<ProgressView> getMyProgress(Authentication auth) {
        long studentId = jwtUserResolver.requireAppUserId(auth);
        return ResponseEntity.ok(facade.getProgress(studentId));
    }

    @GetMapping("/me/level-test/latest")
    public ResponseEntity<LevelTestResultSnapshot> getMyLatestLevelTest(Authentication auth) {
        long studentId = jwtUserResolver.requireAppUserId(auth);
        return ResponseEntity.ok(facade.getLatestLevelTest(studentId));
    }

    @GetMapping("/me/course-access/{courseId}")
    public ResponseEntity<CourseAccessResponse> checkCourseAccess(
            Authentication auth, @PathVariable Long courseId) {
        long studentId = jwtUserResolver.requireAppUserId(auth);
        return ResponseEntity.ok(facade.checkCourseAccess(studentId, courseId));
    }

    @GetMapping("/me/catalog")
    public ResponseEntity<CatalogAccessOverviewDto> getMyCatalog(Authentication auth) {
        long studentId = jwtUserResolver.requireAppUserId(auth);
        return ResponseEntity.ok(facade.getCatalogOverview(studentId));
    }

    @PostMapping("/me/enroll/{courseId}")
    public ResponseEntity<CourseEnrollmentResultView> enrollInCourse(
            Authentication auth, @PathVariable Long courseId) {
        long studentId = jwtUserResolver.requireAppUserId(auth);
        return ResponseEntity.ok(facade.enrollInCourse(studentId, courseId));
    }

    @PutMapping("/me/courses/{courseId}/chapters/{chapterId}/status")
    public ResponseEntity<Void> updateChapterStatus(
            Authentication auth,
            @PathVariable Long courseId,
            @PathVariable Long chapterId,
            @RequestBody MeChapterStatusRequest req) {
        long studentId = jwtUserResolver.requireAppUserId(auth);
        facade.updateChapterStatus(studentId, courseId, chapterId, req);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me/courses/{courseId}/plan")
    public ResponseEntity<LearningPlanView> getLearningPlan(
            Authentication auth, @PathVariable Long courseId) {
        long studentId = jwtUserResolver.requireAppUserId(auth);
        return ResponseEntity.ok(facade.getLearningPlan(studentId, courseId));
    }

    @GetMapping("/me/recommendations")
    public ResponseEntity<List<RecommendationView>> getMyRecommendations(Authentication auth) {
        long studentId = jwtUserResolver.requireAppUserId(auth);
        return ResponseEntity.ok(facade.getRecommendations(studentId));
    }

    // ── Explicit student ID endpoints ───────────────────────────

    @GetMapping("/students/{studentId}/profile")
    public ResponseEntity<ProfileView> getStudentProfile(@PathVariable Long studentId) {
        return ResponseEntity.ok(facade.getProfile(studentId));
    }

    @GetMapping("/students/{studentId}/progress")
    public ResponseEntity<ProgressView> getStudentProgress(@PathVariable Long studentId) {
        return ResponseEntity.ok(facade.getProgress(studentId));
    }

    @GetMapping("/students/{studentId}/learning-path")
    public ResponseEntity<LearningPathView> getStudentLearningPath(@PathVariable Long studentId) {
        return ResponseEntity.ok(facade.getLatestLearningPath(studentId));
    }

    @GetMapping("/students/{studentId}/recommendations")
    public ResponseEntity<List<RecommendationView>> getStudentRecommendations(@PathVariable Long studentId) {
        return ResponseEntity.ok(facade.getRecommendations(studentId));
    }
}
