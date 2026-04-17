package com.smartlingua.adaptive.controller;

import com.smartlingua.adaptive.dto.AdaptiveDtos.*;
import com.smartlingua.adaptive.service.AdaptiveLearningFacadeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/adaptive/teacher")
@PreAuthorize("hasAnyRole('TEACHER','ADMIN') or hasAnyAuthority('ROLE_TEACHER','ROLE_ADMIN','teacher','admin')")
public class AdaptiveTeacherController {

    private final AdaptiveLearningFacadeService facade;

    public AdaptiveTeacherController(AdaptiveLearningFacadeService facade) {
        this.facade = facade;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<TeacherAdaptiveDashboardDto> getDashboard() {
        return ResponseEntity.ok(facade.getTeacherDashboard());
    }

    @GetMapping("/learners")
    public ResponseEntity<List<LearnerPickerEntry>> listLearners() {
        return ResponseEntity.ok(facade.listAllLearners());
    }

    @GetMapping("/learners/{studentId}/profile")
    public ResponseEntity<ProfileView> getLearnerProfile(@PathVariable Long studentId) {
        return ResponseEntity.ok(facade.getProfile(studentId));
    }

    @GetMapping("/learners/{studentId}/progress")
    public ResponseEntity<ProgressView> getLearnerProgress(@PathVariable Long studentId) {
        return ResponseEntity.ok(facade.getProgress(studentId));
    }

    @GetMapping("/learners/{studentId}/learning-path")
    public ResponseEntity<LearningPathView> getLearnerLearningPath(@PathVariable Long studentId) {
        return ResponseEntity.ok(facade.getLatestLearningPath(studentId));
    }

    @GetMapping("/learners/{studentId}/recommendations")
    public ResponseEntity<List<RecommendationView>> getLearnerRecommendations(@PathVariable Long studentId) {
        return ResponseEntity.ok(facade.getRecommendations(studentId));
    }

    @PostMapping("/alerts/{alertId}/resolve")
    public ResponseEntity<Void> resolveAlert(@PathVariable Long alertId) {
        facade.resolveAlert(alertId);
        return ResponseEntity.ok().build();
    }
}
