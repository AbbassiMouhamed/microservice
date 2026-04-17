package com.smartlingua.adaptive.repository;

import com.smartlingua.adaptive.entity.LearningPath;
import com.smartlingua.adaptive.entity.enums.LearningPathStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface LearningPathRepository extends JpaRepository<LearningPath, Long> {
    Optional<LearningPath> findFirstByStudentIdOrderByCreatedAtDesc(Long studentId);

    @EntityGraph(attributePaths = "items")
    Optional<LearningPath> findFirstWithItemsByStudentIdOrderByCreatedAtDesc(Long studentId);

    long countByStatus(LearningPathStatus status);
}
