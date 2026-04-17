package com.smartlingua.quiz.dto;

import jakarta.validation.constraints.NotBlank;

public record NlpAnalyzeRequest(
        @NotBlank String text,
        @NotBlank String language
) {}
