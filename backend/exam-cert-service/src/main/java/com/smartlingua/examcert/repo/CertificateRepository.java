package com.smartlingua.examcert.repo;

import com.smartlingua.examcert.domain.CertificateEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CertificateRepository extends JpaRepository<CertificateEntity, UUID> {

    Optional<CertificateEntity> findByExamAttempt_Id(UUID examAttemptId);

    List<CertificateEntity> findByStudent_IdOrderByIssuedAtDesc(UUID studentId);
}
