package com.smartlingua.examcert.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartlingua.examcert.domain.CertificateEntity;
import com.smartlingua.examcert.domain.ExamAttemptEntity;
import com.smartlingua.examcert.repo.CertificateRepository;
import com.smartlingua.examcert.repo.ExamAttemptRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class CertificateService {

    private final ExamAttemptRepository attemptRepository;
    private final CertificateRepository certificateRepository;
    private final ObjectMapper objectMapper;
    private final SignatureService signatureService;
    private final PdfCertificateService pdfService;

    public CertificateService(
            ExamAttemptRepository attemptRepository,
            CertificateRepository certificateRepository,
            ObjectMapper objectMapper,
            SignatureService signatureService,
            PdfCertificateService pdfService
    ) {
        this.attemptRepository = attemptRepository;
        this.certificateRepository = certificateRepository;
        this.objectMapper = objectMapper;
        this.signatureService = signatureService;
        this.pdfService = pdfService;
    }

    public List<CertificateEntity> listCertificates() {
        return certificateRepository.findAll();
    }

    public List<CertificateEntity> listCertificatesForStudent(UUID studentId) {
        return certificateRepository.findByStudent_IdOrderByIssuedAtDesc(studentId);
    }

    public CertificateEntity getCertificate(UUID certificateId) {
        return certificateRepository.findById(certificateId)
                .orElseThrow(() -> new NotFoundException("Certificate not found"));
    }

    @Transactional
    public void deleteCertificate(UUID certificateId) {
        CertificateEntity cert = getCertificate(certificateId);
        try {
            certificateRepository.delete(cert);
            certificateRepository.flush();
        } catch (DataIntegrityViolationException e) {
            throw new BadRequestException("Cannot delete certificate: it is referenced by other data");
        }
    }

    @Transactional
    public CertificateEntity issueCertificate(UUID examAttemptId) {
        ExamAttemptEntity attempt = attemptRepository.findById(examAttemptId)
                .orElseThrow(() -> new NotFoundException("Exam attempt not found"));

        if (!attempt.isPassed()) {
            throw new BadRequestException("Cannot issue certificate: student did not pass");
        }

        if (certificateRepository.findByExamAttempt_Id(examAttemptId).isPresent()) {
            throw new BadRequestException("Certificate already issued for this attempt");
        }

        UUID certId = UUID.randomUUID();
        OffsetDateTime issuedAt = OffsetDateTime.now(ZoneOffset.UTC);

        String payloadJson = canonicalJson(buildPayload(certId, attempt, issuedAt));
        var signed = signatureService.sign(payloadJson);

        byte[] pdfBytes = pdfService.generate(
                certId,
                attempt.getStudent().getName(),
                attempt.getExam().getTitle(),
                attempt.getSkillLevel(),
                issuedAt,
                signed.signatureBase64()
        );

        CertificateEntity cert = CertificateEntity.builder()
                .id(certId)
                .examAttempt(attempt)
                .student(attempt.getStudent())
                .issuedAt(issuedAt)
                .skillLevel(attempt.getSkillLevel())
                .payloadJson(payloadJson)
                .signatureBase64(signed.signatureBase64())
                .publicKeyPem(signed.publicKeyPem())
                .pdfBytes(pdfBytes)
                .build();

        return certificateRepository.save(cert);
    }

    @Transactional
    public VerifyResult verify(UUID certificateId) {
        CertificateEntity cert = getCertificate(certificateId);
        var publicKey = PemKeyUtils.parsePublicKeyPem(cert.getPublicKeyPem());
        boolean valid = signatureService.verify(cert.getPayloadJson(), cert.getSignatureBase64(), publicKey);

        cert.setLastVerifiedAt(OffsetDateTime.now(ZoneOffset.UTC));
        cert.setLastVerifiedValid(valid);
        certificateRepository.save(cert);

        return new VerifyResult(valid);
    }

    private Map<String, Object> buildPayload(UUID certId, ExamAttemptEntity attempt, OffsetDateTime issuedAt) {
        Map<String, Object> root = new LinkedHashMap<>();
        root.put("certificateId", certId.toString());
        root.put("issuedAt", issuedAt.toString());
        root.put("skillLevel", attempt.getSkillLevel().name());

        Map<String, Object> student = new LinkedHashMap<>();
        student.put("id", attempt.getStudent().getId().toString());
        student.put("name", attempt.getStudent().getName());
        student.put("email", attempt.getStudent().getEmail());
        root.put("student", student);

        Map<String, Object> exam = new LinkedHashMap<>();
        exam.put("id", attempt.getExam().getId().toString());
        exam.put("title", attempt.getExam().getTitle());
        exam.put("courseId", attempt.getExam().getCourse().getId().toString());
        exam.put("maxScore", attempt.getExam().getMaxScore());
        exam.put("passingScore", attempt.getExam().getPassingScore());
        root.put("exam", exam);

        Map<String, Object> attemptPayload = new LinkedHashMap<>();
        attemptPayload.put("id", attempt.getId().toString());
        attemptPayload.put("score", attempt.getScore());
        attemptPayload.put("passed", attempt.isPassed());
        attemptPayload.put("submittedAt", attempt.getSubmittedAt().toString());
        root.put("attempt", attemptPayload);

        return root;
    }

    private String canonicalJson(Object value) {
        try {
            JsonNode node = objectMapper.valueToTree(value);
            return objectMapper.writeValueAsString(node);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to serialize certificate payload", e);
        }
    }

    public record VerifyResult(boolean valid) {
    }
}
