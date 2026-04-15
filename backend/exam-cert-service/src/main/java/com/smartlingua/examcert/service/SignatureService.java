package com.smartlingua.examcert.service;

import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.KeyPair;
import java.security.PublicKey;
import java.security.Signature;
import java.util.Base64;

@Service
public class SignatureService {

    private final SigningKeyService keyService;

    public SignatureService(SigningKeyService keyService) {
        this.keyService = keyService;
    }

    public SignedPayload sign(String canonicalPayload) {
        try {
            KeyPair keyPair = keyService.getOrCreateKeyPair();
            Signature signer = Signature.getInstance("SHA256withRSA");
            signer.initSign(keyPair.getPrivate());
            signer.update(canonicalPayload.getBytes(StandardCharsets.UTF_8));
            byte[] sig = signer.sign();

            return new SignedPayload(
                    Base64.getEncoder().encodeToString(sig),
                    keyService.getPublicKeyPem()
            );
        } catch (Exception e) {
            throw new IllegalStateException("Failed to sign payload", e);
        }
    }

    public boolean verify(String canonicalPayload, String signatureBase64, PublicKey publicKey) {
        try {
            Signature verifier = Signature.getInstance("SHA256withRSA");
            verifier.initVerify(publicKey);
            verifier.update(canonicalPayload.getBytes(StandardCharsets.UTF_8));
            return verifier.verify(Base64.getDecoder().decode(signatureBase64));
        } catch (Exception e) {
            return false;
        }
    }

    public record SignedPayload(String signatureBase64, String publicKeyPem) {
    }
}
