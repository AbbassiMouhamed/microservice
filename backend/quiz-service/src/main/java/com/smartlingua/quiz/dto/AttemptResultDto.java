package com.smartlingua.quiz.dto;

import java.time.Instant;

public record AttemptResultDto(
        Long id,
        String status,
        Double scorePercent,
        String weakAreasAuto,
        Instant startedAt,
        Instant completedAt,
        int totalQuestions,
        int correctAnswers
) {}
