package com.smartlingua.adaptive.repository;

import com.smartlingua.adaptive.entity.StudentLearningProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface StudentLearningProfileRepository extends JpaRepository<StudentLearningProfile, Long> {
    Optional<StudentLearningProfile> findByStudentId(Long studentId);
}
