package com.smartlingua.adaptive.repository;

import com.smartlingua.adaptive.entity.StudentGamification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface StudentGamificationRepository extends JpaRepository<StudentGamification, Long> {
    Optional<StudentGamification> findByStudentId(Long studentId);
}
