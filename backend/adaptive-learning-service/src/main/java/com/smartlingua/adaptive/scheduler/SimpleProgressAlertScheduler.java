package com.smartlingua.adaptive.scheduler;

import com.smartlingua.adaptive.entity.StudentProgress;
import com.smartlingua.adaptive.entity.enums.DifficultySeverity;
import com.smartlingua.adaptive.entity.LearningDifficultyAlert;
import com.smartlingua.adaptive.repository.LearningDifficultyAlertRepository;
import com.smartlingua.adaptive.repository.StudentProgressRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SimpleProgressAlertScheduler {
    private static final Logger log = LoggerFactory.getLogger(SimpleProgressAlertScheduler.class);

    private static final String PREFIX_LOW_PROGRESS = "LOW_PROGRESS";

    private final StudentProgressRepository progressRepo;
    private final LearningDifficultyAlertRepository alertRepo;

    public SimpleProgressAlertScheduler(StudentProgressRepository progressRepo,
                                        LearningDifficultyAlertRepository alertRepo) {
        this.progressRepo = progressRepo;
        this.alertRepo = alertRepo;
    }

    @Scheduled(cron = "${adaptive.scheduler.progress-alert-cron:0 25 * * * *}")
    public void analyzeProgressAlerts() {
        log.debug("Running simple progress alert scheduler...");
        List<StudentProgress> all = progressRepo.findAll();
        for (StudentProgress p : all) {
            try {
                if (p.getCompletionPercentage() != null && p.getCompletionPercentage() < 10.0
                        && p.getTotalItems() != null && p.getTotalItems() > 0) {
                    if (!alertRepo.existsByStudentIdAndResolvedFalseAndReasonStartingWith(
                            p.getStudentId(), PREFIX_LOW_PROGRESS)) {
                        LearningDifficultyAlert alert = new LearningDifficultyAlert();
                        alert.setStudentId(p.getStudentId());
                        alert.setReason(PREFIX_LOW_PROGRESS + ": Only "
                                + String.format("%.0f", p.getCompletionPercentage())
                                + "% completion with " + p.getTotalItems() + " items");
                        alert.setSeverity(DifficultySeverity.LOW);
                        alert.setResolved(false);
                        alert.setLearningPathId(p.getLearningPathId());
                        alertRepo.save(alert);
                    }
                }
            } catch (Exception e) {
                log.warn("Error checking progress for student {}: {}", p.getStudentId(), e.getMessage());
            }
        }
        log.debug("Simple progress alert scheduler complete.");
    }
}
