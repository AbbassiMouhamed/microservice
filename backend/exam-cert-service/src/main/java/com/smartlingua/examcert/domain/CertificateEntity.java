package com.smartlingua.examcert.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "certificates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CertificateEntity {

    @Id
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "exam_attempt_id", nullable = false)
    private ExamAttemptEntity examAttempt;

    @ManyToOne(optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private UserEntity student;

    @Column(name = "issued_at", nullable = false)
    private OffsetDateTime issuedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "skill_level", nullable = false)
    private SkillLevel skillLevel;

    @Lob
    @Column(name = "payload_json", nullable = false, columnDefinition = "LONGTEXT")
    private String payloadJson;

    @Lob
    @Column(name = "signature_base64", nullable = false, columnDefinition = "LONGTEXT")
    private String signatureBase64;

    @Lob
    @Column(name = "public_key_pem", nullable = false, columnDefinition = "LONGTEXT")
    private String publicKeyPem;

    @Lob
    @Column(name = "pdf_bytes", nullable = false, columnDefinition = "LONGBLOB")
    private byte[] pdfBytes;

    @Column(name = "last_verified_at", nullable = true)
    private OffsetDateTime lastVerifiedAt;

    @Column(name = "last_verified_valid", nullable = true)
    private Boolean lastVerifiedValid;
}

