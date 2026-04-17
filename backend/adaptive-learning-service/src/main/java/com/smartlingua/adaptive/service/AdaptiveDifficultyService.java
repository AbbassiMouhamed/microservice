package com.smartlingua.adaptive.service;

import com.smartlingua.adaptive.entity.*;
import com.smartlingua.adaptive.entity.enums.DifficultySeverity;
import com.smartlingua.adaptive.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class AdaptiveDifficultyService {
    private static final Logger log = LoggerFactory.getLogger(AdaptiveDifficultyService.class);

    public static final String PREFIX_SLOW = "SLOW_PROGRESS";
    public static final String PREFIX_INACTIVE = "INACTIVITY";
    public static final String PREFIX_FAIL_TEST = "FAILED_TEST";

    private final StudentProgressRepository progressRepo;
    private final LearningDifficultyAlertRepository alertRepo;
    private final StudentLevelTestResultRepository levelTestRepo;

    public AdaptiveDifficultyService(StudentProgressRepository progressRepo,
                                     LearningDifficultyAlertRepository alertRepo,
                                     StudentLevelTestResultRepository levelTestRepo) {
        this.progressRepo = progressRepo;
        this.alertRepo = alertRepo;
        this.levelTestRepo = levelTestRepo;
    }

    @Transactional
    public void analyzeProgress(StudentProgress progress) {
        if (progress == null) return;
        Long studentId = progress.getStudentId();

        // Check slow progress
        if (progress.getCompletionPercentage() != null && progress.getCompletionPercentage() < 20.0
                && progress.getUpdatedAt() != null
                && progress.getUpdatedAt().isBefore(Instant.now().minus(7, ChronoUnit.DAYS))) {
            createAlertIfNotExists(studentId, PREFIX_SLOW,
                    PREFIX_SLOW + ": Completion at " + String.format("%.0f", progress.getCompletionPercentage())
                            + "% with no recent activity",
                    DifficultySeverity.MEDIUM, progress.getLearningPathId());
        }

        // Check inactivity
        if (progress.getUpdatedAt() != null
                && progress.getUpdatedAt().isBefore(Instant.now().minus(14, ChronoUnit.DAYS))) {
            createAlertIfNotExists(studentId, PREFIX_INACTIVE,
                    PREFIX_INACTIVE + ": No activity for over 14 days",
                    DifficultySeverity.HIGH, progress.getLearningPathId());
        }
    }

    @Transactional
    public void scanFailedTests() {
        Instant since = Instant.now().minus(7, ChronoUnit.DAYS);
        List<StudentProgress> allProgress = progressRepo.findAll();
        for (StudentProgress p : allProgress) {
            if (levelTestRepo.existsByStudentIdAndPassedFalseAndTestDateAfter(p.getStudentId(), since)) {
                createAlertIfNotExists(p.getStudentId(), PREFIX_FAIL_TEST,
                        PREFIX_FAIL_TEST + ": Recent failed level test",
                        DifficultySeverity.HIGH, p.getLearningPathId());
            }
        }
    }

    private void createAlertIfNotExists(Long studentId, String prefix, String reason,
                                        DifficultySeverity severity, Long learningPathId) {
        if (alertRepo.existsByStudentIdAndResolvedFalseAndReasonStartingWith(studentId, prefix)) return;
        LearningDifficultyAlert alert = new LearningDifficultyAlert();
        alert.setStudentId(studentId);
        alert.setReason(reason);
        alert.setSeverity(severity);
        alert.setResolved(false);
        alert.setLearningPathId(learningPathId);
        alertRepo.save(alert);
        log.info("Created difficulty alert for student {} : {}", studentId, prefix);
    }
}
