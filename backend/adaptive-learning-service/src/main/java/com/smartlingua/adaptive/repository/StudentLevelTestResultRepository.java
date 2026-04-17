package com.smartlingua.adaptive.repository;

import com.smartlingua.adaptive.entity.StudentLevelTestResult;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.Instant;
import java.util.Optional;

public interface StudentLevelTestResultRepository extends JpaRepository<StudentLevelTestResult, Long> {
    boolean existsByStudentIdAndPassedFalseAndTestDateAfter(Long studentId, Instant after);
    boolean existsByQuizAttemptId(Long quizAttemptId);
    Optional<StudentLevelTestResult> findTopByStudentIdOrderByTestDateDesc(Long studentId);
}
