package com.smartlingua.adaptive.repository;

import com.smartlingua.adaptive.entity.PedagogicalRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import com.smartlingua.adaptive.entity.enums.LearningPathItemType;
import java.time.Instant;
import java.util.List;

public interface PedagogicalRecommendationRepository extends JpaRepository<PedagogicalRecommendation, Long> {
    List<PedagogicalRecommendation> findByStudentIdAndActiveTrueOrderByCreatedAtDesc(Long studentId);
    List<PedagogicalRecommendation> findTop15ByActiveTrueOrderByCreatedAtDesc();
    long countByActiveTrue();
    long countByCreatedAtAfter(Instant after);
    boolean existsByStudentIdAndItemTypeAndRefItemIdAndCreatedAtAfter(Long studentId, LearningPathItemType itemType, Long refItemId, Instant after);
}
