package com.smartlingua.adaptive.repository;

import com.smartlingua.adaptive.entity.LearningPathItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LearningPathItemRepository extends JpaRepository<LearningPathItem, Long> {
    List<LearningPathItem> findByLearningPath_IdOrderByRecommendedOrderAsc(Long learningPathId);
}
