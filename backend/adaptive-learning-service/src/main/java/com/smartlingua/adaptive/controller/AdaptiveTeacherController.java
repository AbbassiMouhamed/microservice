package com.smartlingua.adaptive.controller;

import com.smartlingua.adaptive.dto.AdaptiveDtos.*;
import com.smartlingua.adaptive.service.AdaptiveLearningFacadeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/adaptive/teacher")
@PreAuthorize("hasAnyRole('TEACHER','ADMIN') or hasAnyAuthority('ROLE_TEACHER','ROLE_ADMIN','teacher','admin')")
@Tag(name = "Adaptive Learning (Teacher)", description = "Teacher and admin endpoints for adaptive learning management")
public class AdaptiveTeacherController {

    private final AdaptiveLearningFacadeService facade;

    public AdaptiveTeacherController(AdaptiveLearningFacadeService facade) {
        this.facade = facade;
    }

    @Operation(summary = "Get teacher dashboard", description = "Retrieve the adaptive learning teacher dashboard")
    @GetMapping("/dashboard")
    public ResponseEntity<TeacherAdaptiveDashboardDto> getDashboard() {
        return ResponseEntity.ok(facade.getTeacherDashboard());
    }

    @Operation(summary = "List learners", description = "Retrieve a list of all learners")
    @GetMapping("/learners")
    public ResponseEntity<List<LearnerPickerEntry>> listLearners() {
        return ResponseEntity.ok(facade.listAllLearners());
    }

    @Operation(summary = "Get learner profile", description = "Retrieve a specific learner's profile")
    @GetMapping("/learners/{studentId}/profile")
    public ResponseEntity<ProfileView> getLearnerProfile(@PathVariable Long studentId) {
        return ResponseEntity.ok(facade.getProfile(studentId));
    }

    @Operation(summary = "Get learner progress", description = "Retrieve a specific learner's progress")
    @GetMapping("/learners/{studentId}/progress")
    public ResponseEntity<ProgressView> getLearnerProgress(@PathVariable Long studentId) {
        return ResponseEntity.ok(facade.getProgress(studentId));
    }

    @Operation(summary = "Get learner learning path", description = "Retrieve a specific learner's learning path")
    @GetMapping("/learners/{studentId}/learning-path")
    public ResponseEntity<LearningPathView> getLearnerLearningPath(@PathVariable Long studentId) {
        return ResponseEntity.ok(facade.getLatestLearningPath(studentId));
    }

    @Operation(summary = "Get learner recommendations", description = "Retrieve recommendations for a specific learner")
    @GetMapping("/learners/{studentId}/recommendations")
    public ResponseEntity<List<RecommendationView>> getLearnerRecommendations(@PathVariable Long studentId) {
        return ResponseEntity.ok(facade.getRecommendations(studentId));
    }

    @Operation(summary = "Resolve alert", description = "Mark a teacher alert as resolved")
    @PostMapping("/alerts/{alertId}/resolve")
    public ResponseEntity<Void> resolveAlert(@PathVariable Long alertId) {
        facade.resolveAlert(alertId);
        return ResponseEntity.ok().build();
    }
}
