package com.smartlingua.adaptive.scheduler;

import com.smartlingua.adaptive.dto.external.CourseExternalDto;
import com.smartlingua.adaptive.entity.StudentLearningProfile;
import com.smartlingua.adaptive.entity.StudentProgress;
import com.smartlingua.adaptive.feign.CoursesClient;
import com.smartlingua.adaptive.repository.StudentLearningProfileRepository;
import com.smartlingua.adaptive.repository.StudentProgressRepository;
import com.smartlingua.adaptive.service.AdaptivePedagogyService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
public class RecommendationScheduler {
    private static final Logger log = LoggerFactory.getLogger(RecommendationScheduler.class);

    private final StudentProgressRepository progressRepo;
    private final StudentLearningProfileRepository profileRepo;
    private final AdaptivePedagogyService pedagogyService;
    private final CoursesClient coursesClient;

    public RecommendationScheduler(StudentProgressRepository progressRepo,
                                   StudentLearningProfileRepository profileRepo,
                                   AdaptivePedagogyService pedagogyService,
                                   CoursesClient coursesClient) {
        this.progressRepo = progressRepo;
        this.profileRepo = profileRepo;
        this.pedagogyService = pedagogyService;
        this.coursesClient = coursesClient;
    }

    @Scheduled(cron = "${adaptive.scheduler.recommendation-cron:0 15 * * * *}")
    public void generateRecommendations() {
        log.debug("Running recommendation scheduler...");
        List<CourseExternalDto> courses;
        try {
            courses = coursesClient.getAllCourses(null);
        } catch (Exception e) {
            log.warn("Cannot fetch courses for recommendations: {}", e.getMessage());
            return;
        }

        Instant cutoff = Instant.now().minus(7, ChronoUnit.DAYS);
        List<StudentProgress> allProgress = progressRepo.findAll();

        for (StudentProgress p : allProgress) {
            try {
                if (p.getCompletionPercentage() != null && p.getCompletionPercentage() < 30.0
                        && p.getUpdatedAt() != null && p.getUpdatedAt().isBefore(cutoff)) {
                    StudentLearningProfile profile = profileRepo.findByStudentId(p.getStudentId()).orElse(null);
                    if (profile != null) {
                        pedagogyService.generateRecommendationsForStrugglingStudent(
                                p.getStudentId(), profile.getCurrentLevel(), courses);
                    }
                }
            } catch (Exception e) {
                log.warn("Recommendation generation failed for student {}: {}", p.getStudentId(), e.getMessage());
            }
        }
        log.debug("Recommendation scheduler complete.");
    }
}
