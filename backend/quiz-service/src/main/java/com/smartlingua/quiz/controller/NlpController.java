package com.smartlingua.quiz.controller;

import com.smartlingua.quiz.dto.NlpAnalyzeRequest;
import com.smartlingua.quiz.dto.NlpAnalyzeResponse;
import com.smartlingua.quiz.service.NlpService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/quiz/nlp")
@Tag(name = "NLP", description = "Natural language processing for quiz answers")
public class NlpController {

    private final NlpService nlpService;

    public NlpController(NlpService nlpService) {
        this.nlpService = nlpService;
    }

    @PostMapping("/analyze")
    @Operation(summary = "Analyze text with NLP")
    public NlpAnalyzeResponse analyze(@Valid @RequestBody NlpAnalyzeRequest request) {
        return nlpService.analyze(request);
    }
}
