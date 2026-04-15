package com.smartlingua.examcert.repo;

import com.smartlingua.examcert.domain.ExamEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ExamRepository extends JpaRepository<ExamEntity, UUID> {
}
