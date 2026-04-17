package com.smartlingua.quiz.controller;

import com.smartlingua.quiz.dto.NlpAnalyzeRequest;
import com.smartlingua.quiz.dto.NlpAnalyzeResponse;
import com.smartlingua.quiz.service.NlpService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/quiz/nlp")
public class NlpController {

    private final NlpService nlpService;

    public NlpController(NlpService nlpService) {
        this.nlpService = nlpService;
    }

    @PostMapping("/analyze")
    public NlpAnalyzeResponse analyze(@Valid @RequestBody NlpAnalyzeRequest request) {
        return nlpService.analyze(request);
    }
}
