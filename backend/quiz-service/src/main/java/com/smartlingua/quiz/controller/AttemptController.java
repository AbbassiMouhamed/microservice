package com.smartlingua.quiz.controller;

import com.smartlingua.quiz.dto.AttemptResultDto;
import com.smartlingua.quiz.dto.SubmitAnswersRequest;
import com.smartlingua.quiz.service.AttemptService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quiz/attempts")
public class AttemptController {

    private final AttemptService attemptService;

    public AttemptController(AttemptService attemptService) {
        this.attemptService = attemptService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AttemptResultDto start(@AuthenticationPrincipal Jwt jwt) {
        return attemptService.start(jwt.getSubject());
    }

    @PostMapping("/{id}/complete")
    public AttemptResultDto complete(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody SubmitAnswersRequest request) {
        return attemptService.complete(id, jwt.getSubject(), request);
    }

    @GetMapping("/{id}")
    public AttemptResultDto getResult(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        return attemptService.getResult(id, jwt.getSubject());
    }

    @GetMapping
    public List<AttemptResultDto> myAttempts(@AuthenticationPrincipal Jwt jwt) {
        return attemptService.getMyAttempts(jwt.getSubject());
    }
}
