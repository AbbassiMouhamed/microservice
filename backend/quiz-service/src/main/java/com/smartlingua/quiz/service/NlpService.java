package com.smartlingua.quiz.service;

import com.smartlingua.quiz.dto.NlpAnalyzeRequest;
import com.smartlingua.quiz.dto.NlpAnalyzeResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

/**
 * Calls the LanguageTool API for grammar/spelling analysis.
 */
@Service
public class NlpService {

    private final WebClient webClient;

    public NlpService(@Value("${quiz.nlp.language-tool-url}") String languageToolUrl) {
        this.webClient = WebClient.builder().baseUrl(languageToolUrl).build();
    }

    public NlpAnalyzeResponse analyze(NlpAnalyzeRequest request) {
        @SuppressWarnings("unchecked")
        Map<String, Object> response = webClient.post()
                .uri(uriBuilder -> uriBuilder
                        .queryParam("text", request.text())
                        .queryParam("language", request.language())
                        .build())
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (response == null) {
            return new NlpAnalyzeResponse(request.text(), 0, 100.0);
        }

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> matches = (List<Map<String, Object>>) response.getOrDefault("matches", List.of());
        int errors = matches.size();

        // Build corrected text by applying replacements in reverse order
        String corrected = request.text();
        for (int i = matches.size() - 1; i >= 0; i--) {
            Map<String, Object> match = matches.get(i);
            int offset = ((Number) match.get("offset")).intValue();
            int length = ((Number) match.get("length")).intValue();
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> replacements = (List<Map<String, Object>>) match.getOrDefault("replacements", List.of());
            if (!replacements.isEmpty()) {
                String replacement = (String) replacements.get(0).get("value");
                corrected = corrected.substring(0, offset) + replacement + corrected.substring(offset + length);
            }
        }

        int textLength = request.text().length();
        double score = textLength > 0 ? Math.max(0, 100.0 - (errors * 100.0 / textLength) * 10) : 100.0;

        return new NlpAnalyzeResponse(corrected, errors, Math.round(score * 100.0) / 100.0);
    }
}
