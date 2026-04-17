package com.smartlingua.adaptive.repository;

import com.smartlingua.adaptive.entity.StudentProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface StudentProgressRepository extends JpaRepository<StudentProgress, Long> {
    Optional<StudentProgress> findTopByStudentIdOrderByUpdatedAtDesc(Long studentId);
    List<StudentProgress> findByLearningPathId(Long learningPathId);

    @Query("SELECT AVG(p.completionPercentage) FROM StudentProgress p")
    Double averageCompletionPercentage();
}
