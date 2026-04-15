package com.smartlingua.examcert.service;

import com.smartlingua.examcert.config.AppProperties;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

@Service
public class SigningKeyService {

    private static final String PRIVATE_KEY_FILE = "signing-private-key.pem";
    private static final String PUBLIC_KEY_FILE = "signing-public-key.pem";

    private final AppProperties properties;

    private volatile KeyPair cached;

    public SigningKeyService(AppProperties properties) {
        this.properties = properties;
    }

    public KeyPair getOrCreateKeyPair() {
        KeyPair existing = cached;
        if (existing != null) {
            return existing;
        }
        synchronized (this) {
            if (cached != null) {
                return cached;
            }
            cached = loadOrCreate();
            return cached;
        }
    }

    public String getPublicKeyPem() {
        PublicKey publicKey = getOrCreateKeyPair().getPublic();
        return toPem("PUBLIC KEY", publicKey.getEncoded());
    }

    private KeyPair loadOrCreate() {
        try {
            Path keysDir = Path.of(properties.signing().keysDir());
            Files.createDirectories(keysDir);

            Path privatePath = keysDir.resolve(PRIVATE_KEY_FILE);
            Path publicPath = keysDir.resolve(PUBLIC_KEY_FILE);

            if (Files.exists(privatePath) && Files.exists(publicPath)) {
                PrivateKey privateKey = readPrivateKey(privatePath);
                PublicKey publicKey = readPublicKey(publicPath);
                return new KeyPair(publicKey, privateKey);
            }

            KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
            generator.initialize(2048);
            KeyPair pair = generator.generateKeyPair();

            Files.writeString(privatePath, toPem("PRIVATE KEY", pair.getPrivate().getEncoded()), StandardCharsets.UTF_8);
            Files.writeString(publicPath, toPem("PUBLIC KEY", pair.getPublic().getEncoded()), StandardCharsets.UTF_8);

            return pair;
        } catch (Exception e) {
            throw new IllegalStateException("Failed to load/create signing keypair", e);
        }
    }

    private static PrivateKey readPrivateKey(Path path) throws Exception {
        byte[] der = readPemBody(path);
        PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(der);
        return KeyFactory.getInstance("RSA").generatePrivate(spec);
    }

    private static PublicKey readPublicKey(Path path) throws Exception {
        byte[] der = readPemBody(path);
        X509EncodedKeySpec spec = new X509EncodedKeySpec(der);
        return KeyFactory.getInstance("RSA").generatePublic(spec);
    }

    private static byte[] readPemBody(Path path) throws Exception {
        String pem = Files.readString(path, StandardCharsets.UTF_8);
        String body = pem
                .replaceAll("-----BEGIN [A-Z ]+-----", "")
                .replaceAll("-----END [A-Z ]+-----", "")
                .replaceAll("\\s", "");
        return Base64.getDecoder().decode(body);
    }

    private static String toPem(String type, byte[] der) {
        String encoded = Base64.getMimeEncoder(64, "\n".getBytes(StandardCharsets.UTF_8)).encodeToString(der);
        return "-----BEGIN " + type + "-----\n" + encoded + "\n-----END " + type + "-----\n";
    }
}
