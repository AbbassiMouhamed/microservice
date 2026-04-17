package com.smartlingua.adaptive.repository;

import com.smartlingua.adaptive.entity.LearningDifficultyAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface LearningDifficultyAlertRepository extends JpaRepository<LearningDifficultyAlert, Long> {
    long countByResolvedFalse();
    long countByStudentIdAndResolvedFalse(Long studentId);

    @Query("SELECT COUNT(DISTINCT a.studentId) FROM LearningDifficultyAlert a WHERE a.resolved = false")
    long countDistinctStudentsWithOpenAlerts();

    List<LearningDifficultyAlert> findTop20ByResolvedFalseOrderByCreatedAtDesc();
    List<LearningDifficultyAlert> findByStudentIdAndResolvedFalseOrderByCreatedAtDesc(Long studentId);
    boolean existsByStudentIdAndResolvedFalseAndReasonStartingWith(Long studentId, String reasonPrefix);
}
