package com.smartlingua.examcert.web;

import com.smartlingua.examcert.domain.CertificateEntity;
import com.smartlingua.examcert.domain.SkillLevel;
import com.smartlingua.examcert.service.CertificateService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/certificates")
public class CertificateController {

    private final CertificateService certificateService;

    public CertificateController(CertificateService certificateService) {
        this.certificateService = certificateService;
    }

    @GetMapping
    public List<CertificateResponse> list() {
        return certificateService.listCertificates().stream().map(CertificateResponse::from).toList();
    }

    @GetMapping("/{id}")
    public CertificateResponse get(@PathVariable("id") UUID id) {
        return CertificateResponse.from(certificateService.getCertificate(id));
    }

    @PostMapping("/issue")
    public CertificateResponse issue(@RequestBody @Valid IssueCertificateRequest req) {
        return CertificateResponse.from(certificateService.issueCertificate(req.examAttemptId()));
    }

    @GetMapping("/{id}/verify")
    public CertificateService.VerifyResult verify(@PathVariable("id") UUID id) {
        return certificateService.verify(id);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> download(@PathVariable("id") UUID id) {
        CertificateEntity cert = certificateService.getCertificate(id);
        String filename = "certificate-" + cert.getId() + ".pdf";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.attachment().filename(filename).build());

        return ResponseEntity.ok().headers(headers).body(cert.getPdfBytes());
    }

    public record IssueCertificateRequest(@NotNull UUID examAttemptId) {
    }

    public record CertificateResponse(
            UUID id,
            UUID examAttemptId,
            UUID studentId,
            OffsetDateTime issuedAt,
            SkillLevel skillLevel,
            String signatureBase64
    ) {
        static CertificateResponse from(CertificateEntity c) {
            return new CertificateResponse(
                    c.getId(),
                    c.getExamAttempt().getId(),
                    c.getStudent().getId(),
                    c.getIssuedAt(),
                    c.getSkillLevel(),
                    c.getSignatureBase64()
            );
        }
    }
}
