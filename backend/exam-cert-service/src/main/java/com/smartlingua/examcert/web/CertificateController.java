package com.smartlingua.examcert.web;

import com.smartlingua.examcert.domain.CertificateEntity;
import com.smartlingua.examcert.domain.SkillLevel;
import com.smartlingua.examcert.service.CertificateService;
import com.smartlingua.examcert.service.NotFoundException;
import com.smartlingua.examcert.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/certificates")
public class CertificateController {

    private final CertificateService certificateService;
    private final UserService userService;

    public CertificateController(CertificateService certificateService, UserService userService) {
        this.certificateService = certificateService;
        this.userService = userService;
    }

    @GetMapping
    public List<CertificateResponse> list() {
        return certificateService.listCertificates().stream().map(CertificateResponse::from).toList();
    }

    @GetMapping("/me")
    public List<CertificateResponse> listMine(JwtAuthenticationToken auth) {
        var student = resolveStudent(auth);
        return certificateService.listCertificatesForStudent(student.getId()).stream().map(CertificateResponse::from).toList();
    }

    @GetMapping("/{id}")
    public CertificateResponse get(@PathVariable("id") UUID id) {
        return CertificateResponse.from(certificateService.getCertificate(id));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable("id") UUID id) {
        certificateService.deleteCertificate(id);
    }

    @PostMapping("/issue")
    public CertificateResponse issue(@RequestBody @Valid IssueCertificateRequest req) {
        return CertificateResponse.from(certificateService.issueCertificate(req.examAttemptId()));
    }

    @GetMapping("/{id}/verify")
    public CertificateService.VerifyResult verify(@PathVariable("id") UUID id) {
        return certificateService.verify(id);
    }

    @GetMapping("/me/{id}/verify")
    public CertificateService.VerifyResult verifyMine(@PathVariable("id") UUID id, JwtAuthenticationToken auth) {
        requireOwnedCertificate(id, auth);
        return certificateService.verify(id);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> download(@PathVariable("id") UUID id) {
        CertificateEntity cert = certificateService.getCertificate(id);
        return toPdfResponse(cert);
    }

    @GetMapping("/me/{id}/download")
    public ResponseEntity<byte[]> downloadMine(@PathVariable("id") UUID id, JwtAuthenticationToken auth) {
        CertificateEntity cert = requireOwnedCertificate(id, auth);
        return toPdfResponse(cert);
    }

    private com.smartlingua.examcert.domain.UserEntity resolveStudent(JwtAuthenticationToken auth) {
        String email = auth.getToken().getClaimAsString("email");
        String username = auth.getToken().getClaimAsString("preferred_username");
        return userService.getOrCreateStudent(username, email);
    }

    private CertificateEntity requireOwnedCertificate(UUID certificateId, JwtAuthenticationToken auth) {
        var student = resolveStudent(auth);
        CertificateEntity cert = certificateService.getCertificate(certificateId);

        if (!cert.getStudent().getId().equals(student.getId())) {
            throw new NotFoundException("Certificate not found");
        }

        return cert;
    }

    private ResponseEntity<byte[]> toPdfResponse(CertificateEntity cert) {
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
            String studentName,
            String studentEmail,
            String examTitle,
            OffsetDateTime issuedAt,
            SkillLevel skillLevel,
            String signatureBase64
    ) {
        static CertificateResponse from(CertificateEntity c) {
            return new CertificateResponse(
                    c.getId(),
                    c.getExamAttempt().getId(),
                    c.getStudent().getId(),
                    c.getStudent().getName(),
                    c.getStudent().getEmail(),
                    c.getExamAttempt().getExam().getTitle(),
                    c.getIssuedAt(),
                    c.getSkillLevel(),
                    c.getSignatureBase64()
            );
        }
    }
}
