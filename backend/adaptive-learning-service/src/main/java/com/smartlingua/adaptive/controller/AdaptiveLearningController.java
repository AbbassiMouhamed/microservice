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
@RequestMapping("/api/adaptive")
@Tag(name = "Adaptive Learning", description = "Student adaptive learning endpoints")
public class AdaptiveLearningController {

    private final AdaptiveLearningFacadeService facade;
    private final JwtUserResolver jwtUserResolver;

    public AdaptiveLearningController(AdaptiveLearningFacadeService facade,
                                      JwtUserResolver jwtUserResolver) {
        this.facade = facade;
        this.jwtUserResolver = jwtUserResolver;
    }

    // ── /me/* endpoints (current user) ──────────────────────────

    @Operation(summary = "Submit placement test", description = "Submit answers for the placement test to determine initial level")
    @PostMapping("/me/placement-test")
    public ResponseEntity<PlacementTestSubmitResponse> submitPlacementTest(
            Authentication auth, @RequestBody PlacementTestSubmitRequest req) {
        long studentId = jwtUserResolver.requireAppUserId(auth);
        return ResponseEntity.ok(facade.submitPlacementTest(studentId, req));
    }

    @Operation(summary = "Generate learning path", description = "Generate a personalized learning path for the current user")
    @PostMapping("/me/learning-path")
    public ResponseEntity<LearningPathView> generateLearningPath(
            Authentication auth, @RequestBody GenerateLearningPathRequest req) {
        long studentId = jwtUserResolver.requireAppUserId(auth);
        return ResponseEntity.ok(facade.generateLearningPath(studentId, req));
    }

    @Operation(summary = "Get my learning path", description = "Retrieve the latest learning path for the current user")
    @GetMapping("/me/learning-path")
    public ResponseEntity<LearningPathView> getMyLearningPath(Authentication auth) {
        long studentId = jwtUserResolver.requireAppUserId(auth);
        LearningPathView view = facade.getLatestLearningPath(studentId);
        return view != null ? ResponseEntity.ok(view) : ResponseEntity.noContent().build();
    }

    @Operation(summary = "Update learning path item status", description = "Update the status of a specific learning path item")
    @PutMapping("/me/learning-path/items/{itemId}/status")
    public ResponseEntity<LearningPathItemView> updateItemStatus(
            Authentication auth, @PathVariable Long itemId,
            @RequestBody UpdateItemStatusRequest req) {
        long studentId = jwtUserResolver.requireAppUserId(auth);
        return ResponseEntity.ok(facade.updateItemStatus(studentId, itemId, req));
    }

    @Operation(summary = "Submit level test", description = "Submit answers for a level assessment test")
    @PostMapping("/me/level-test")
    public ResponseEntity<LevelTestSubmitResponse> submitLevelTest(
            Authentication auth, @RequestBody LevelTestSubmitRequest req) {
        long studentId = jwtUserResolver.requireAppUserId(auth);
        return ResponseEntity.ok(facade.submitLevelTest(studentId, req));
    }

    @Operation(summary = "Submit level test from quiz", description = "Submit a level test derived from a quiz result")
    @PostMapping("/me/level-test/from-quiz")
    public ResponseEntity<LevelTestSubmitResponse> submitLevelTestFromQuiz(
            Authentication auth, @RequestBody MeLevelTestFromQuizRequest req) {
        long studentId = jwtUserResolver.requireAppUserId(auth);
        return ResponseEntity.ok(facade.submitLevelTestFromQuiz(studentId, req));
    }

    @Operation(summary = "Get my profile", description = "Retrieve the adaptive learning profile for the current user")
    @GetMapping("/me/profile")
    public ResponseEntity<ProfileView> getMyProfile(Authentication auth) {
        long studentId = jwtUserResolver.requireAppUserId(auth);
        return ResponseEntity.ok(facade.getProfile(studentId));
    }

    @Operation(summary = "Get my progress", description = "Retrieve learning progress for the current user")
    @GetMapping("/me/progress")
    public ResponseEntity<ProgressView> getMyProgress(Authentication auth) {
        long studentId = jwtUserResolver.requireAppUserId(auth);
        return ResponseEntity.ok(facade.getProgress(studentId));
    }

    @Operation(summary = "Get latest level test result", description = "Retrieve the most recent level test result for the current user")
    @GetMapping("/me/level-test/latest")
    public ResponseEntity<LevelTestResultSnapshot> getMyLatestLevelTest(Authentication auth) {
        long studentId = jwtUserResolver.requireAppUserId(auth);
        return ResponseEntity.ok(facade.getLatestLevelTest(studentId));
    }

    @Operation(summary = "Check course access", description = "Check whether the current user has access to a specific course")
    @GetMapping("/me/course-access/{courseId}")
    public ResponseEntity<CourseAccessResponse> checkCourseAccess(
            Authentication auth, @PathVariable Long courseId) {
        long studentId = jwtUserResolver.requireAppUserId(auth);
        return ResponseEntity.ok(facade.checkCourseAccess(studentId, courseId));
    }

    @Operation(summary = "Get my catalog", description = "Retrieve the course catalog with access overview for the current user")
    @GetMapping("/me/catalog")
    public ResponseEntity<CatalogAccessOverviewDto> getMyCatalog(Authentication auth) {
        long studentId = jwtUserResolver.requireAppUserId(auth);
        return ResponseEntity.ok(facade.getCatalogOverview(studentId));
    }

    @Operation(summary = "Enroll in course", description = "Enroll the current user in a specific course")
    @PostMapping("/me/enroll/{courseId}")
    public ResponseEntity<CourseEnrollmentResultView> enrollInCourse(
            Authentication auth, @PathVariable Long courseId) {
        long studentId = jwtUserResolver.requireAppUserId(auth);
        return ResponseEntity.ok(facade.enrollInCourse(studentId, courseId));
    }

    @Operation(summary = "Update chapter status", description = "Update the completion status of a chapter within a course")
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

    @Operation(summary = "Get learning plan", description = "Retrieve the learning plan for a specific course")
    @GetMapping("/me/courses/{courseId}/plan")
    public ResponseEntity<LearningPlanView> getLearningPlan(
            Authentication auth, @PathVariable Long courseId) {
        long studentId = jwtUserResolver.requireAppUserId(auth);
        return ResponseEntity.ok(facade.getLearningPlan(studentId, courseId));
    }

    @Operation(summary = "Get my recommendations", description = "Retrieve personalized course and content recommendations")
    @GetMapping("/me/recommendations")
    public ResponseEntity<List<RecommendationView>> getMyRecommendations(Authentication auth) {
        long studentId = jwtUserResolver.requireAppUserId(auth);
        return ResponseEntity.ok(facade.getRecommendations(studentId));
    }

    // ── Explicit student ID endpoints ───────────────────────────

    @Operation(summary = "Get student profile", description = "Retrieve a specific student's adaptive learning profile")
    @GetMapping("/students/{studentId}/profile")
    public ResponseEntity<ProfileView> getStudentProfile(@PathVariable Long studentId) {
        return ResponseEntity.ok(facade.getProfile(studentId));
    }

    @Operation(summary = "Get student progress", description = "Retrieve a specific student's learning progress")
    @GetMapping("/students/{studentId}/progress")
    public ResponseEntity<ProgressView> getStudentProgress(@PathVariable Long studentId) {
        return ResponseEntity.ok(facade.getProgress(studentId));
    }

    @Operation(summary = "Get student learning path", description = "Retrieve a specific student's learning path")
    @GetMapping("/students/{studentId}/learning-path")
    public ResponseEntity<LearningPathView> getStudentLearningPath(@PathVariable Long studentId) {
        return ResponseEntity.ok(facade.getLatestLearningPath(studentId));
    }

    @Operation(summary = "Get student recommendations", description = "Retrieve recommendations for a specific student")
    @GetMapping("/students/{studentId}/recommendations")
    public ResponseEntity<List<RecommendationView>> getStudentRecommendations(@PathVariable Long studentId) {
        return ResponseEntity.ok(facade.getRecommendations(studentId));
    }
}
