package com.smartlingua.adaptive.scheduler;

import com.smartlingua.adaptive.entity.StudentProgress;
import com.smartlingua.adaptive.repository.StudentProgressRepository;
import com.smartlingua.adaptive.service.AdaptiveDifficultyService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DifficultyMonitoringScheduler {
    private static final Logger log = LoggerFactory.getLogger(DifficultyMonitoringScheduler.class);

    private final StudentProgressRepository progressRepo;
    private final AdaptiveDifficultyService difficultyService;

    public DifficultyMonitoringScheduler(StudentProgressRepository progressRepo,
                                         AdaptiveDifficultyService difficultyService) {
        this.progressRepo = progressRepo;
        this.difficultyService = difficultyService;
    }

    @Scheduled(cron = "${adaptive.scheduler.difficulty-cron:0 */10 * * * *}")
    public void monitorDifficulties() {
        log.debug("Running difficulty monitoring...");
        List<StudentProgress> all = progressRepo.findAll();
        for (StudentProgress p : all) {
            try {
                difficultyService.analyzeProgress(p);
            } catch (Exception e) {
                log.warn("Error analyzing progress for student {}: {}", p.getStudentId(), e.getMessage());
            }
        }
        try {
            difficultyService.scanFailedTests();
        } catch (Exception e) {
            log.warn("Error scanning failed tests: {}", e.getMessage());
        }
        log.debug("Difficulty monitoring complete.");
    }
}
