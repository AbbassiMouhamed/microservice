package com.smartlingua.quiz.dto;

public record NlpAnalyzeResponse(
        String correctedText,
        int errorsCount,
        double score
) {}
