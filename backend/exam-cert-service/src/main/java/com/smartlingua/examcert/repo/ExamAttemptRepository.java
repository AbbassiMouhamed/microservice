package com.smartlingua.examcert.repo;

import com.smartlingua.examcert.domain.ExamAttemptEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ExamAttemptRepository extends JpaRepository<ExamAttemptEntity, UUID> {

    List<ExamAttemptEntity> findByExam_Id(UUID examId);

    Optional<ExamAttemptEntity> findByExam_IdAndStudent_Id(UUID examId, UUID studentId);
}
