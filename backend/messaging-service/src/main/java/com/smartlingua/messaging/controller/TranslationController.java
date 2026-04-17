package com.smartlingua.messaging.controller;

import com.smartlingua.messaging.entity.TranslationHistory;
import com.smartlingua.messaging.repository.TranslationHistoryRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messaging/translate")
public class TranslationController {

    private static final String MY_MEMORY_URL = "https://api.mymemory.translated.net/get";
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
    private final TranslationHistoryRepository translationHistoryRepository;

    public TranslationController(TranslationHistoryRepository translationHistoryRepository) {
        this.translationHistoryRepository = translationHistoryRepository;
    }

    @GetMapping("/languages")
    public ResponseEntity<List<Map<String, String>>> languages() {
        return ResponseEntity.ok(List.of(
                Map.of("code", "en", "name", "English"), Map.of("code", "fr", "name", "French"),
                Map.of("code", "ar", "name", "Arabic"), Map.of("code", "es", "name", "Spanish"),
                Map.of("code", "de", "name", "German"), Map.of("code", "it", "name", "Italian"),
                Map.of("code", "pt", "name", "Portuguese"), Map.of("code", "nl", "name", "Dutch"),
                Map.of("code", "ru", "name", "Russian"), Map.of("code", "zh", "name", "Chinese"),
                Map.of("code", "ja", "name", "Japanese"), Map.of("code", "ko", "name", "Korean"),
                Map.of("code", "tr", "name", "Turkish"), Map.of("code", "pl", "name", "Polish"),
                Map.of("code", "ro", "name", "Romanian"), Map.of("code", "el", "name", "Greek")
        ));
    }

    @GetMapping("/history")
    public ResponseEntity<?> history(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Missing X-User-Id header."));
        List<TranslationHistory> rows = translationHistoryRepository.findTop20ByUserIdOrderByCreatedAtDesc(userId);
        List<Map<String, Object>> response = new ArrayList<>();
        for (TranslationHistory row : rows) {
            response.add(Map.of(
                    "id", row.getId(), "sourceLanguage", row.getSourceLanguage(),
                    "targetLanguage", row.getTargetLanguage(), "inputText", row.getInputText(),
                    "translatedText", row.getTranslatedText(), "provider", row.getProvider(),
                    "createdAt", row.getCreatedAt()));
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> translate(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestBody TranslateRequest req) {
        if (req == null || isBlank(req.q) || isBlank(req.source) || isBlank(req.target))
            return ResponseEntity.badRequest().body(Map.of("message", "q, source and target are required."));
        if (req.source.equalsIgnoreCase(req.target))
            return ResponseEntity.badRequest().body(Map.of("message", "source and target must be different."));
        try {
            String query = URLEncoder.encode(req.q, StandardCharsets.UTF_8);
            String langPair = URLEncoder.encode(req.source + "|" + req.target, StandardCharsets.UTF_8);
            HttpRequest httpReq = HttpRequest.newBuilder()
                    .uri(URI.create(MY_MEMORY_URL + "?q=" + query + "&langpair=" + langPair))
                    .timeout(Duration.ofSeconds(20)).GET().build();
            HttpResponse<String> resp = httpClient.send(httpReq, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            JsonNode node = objectMapper.readTree(resp.body());
            String translatedText = node.path("responseData").path("translatedText").asText("");
            if (translatedText.isBlank())
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(Map.of("message", "Translation provider unavailable."));
            if (userId != null) {
                TranslationHistory history = new TranslationHistory();
                history.setUserId(userId);
                history.setSourceLanguage(req.source);
                history.setTargetLanguage(req.target);
                history.setInputText(req.q);
                history.setTranslatedText(translatedText);
                history.setProvider("mymemory");
                translationHistoryRepository.save(history);
            }
            return ResponseEntity.ok(Map.of("translatedText", translatedText, "provider", "mymemory", "createdAt", LocalDateTime.now().toString()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(Map.of("message", "Failed to translate text."));
        }
    }

    private boolean isBlank(String value) { return value == null || value.trim().isEmpty(); }

    public static class TranslateRequest {
        public String q;
        public String source;
        public String target;
    }
}
