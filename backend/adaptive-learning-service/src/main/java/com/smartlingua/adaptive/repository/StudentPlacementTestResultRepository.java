package com.smartlingua.adaptive.repository;

import com.smartlingua.adaptive.entity.StudentPlacementTestResult;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface StudentPlacementTestResultRepository extends JpaRepository<StudentPlacementTestResult, Long> {
    Optional<StudentPlacementTestResult> findTopByStudentIdOrderByTestDateDesc(Long studentId);
    boolean existsByStudentId(Long studentId);
}
