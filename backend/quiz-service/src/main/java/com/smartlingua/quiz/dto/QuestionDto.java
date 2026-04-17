package com.smartlingua.quiz.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record QuestionDto(
        Long id,
        @NotBlank String questionText,
        @NotBlank String level,
        @NotBlank String skillType,
        @NotBlank String correctAnswer,
        String optionA,
        String optionB,
        String optionC,
        String optionD
) {}
