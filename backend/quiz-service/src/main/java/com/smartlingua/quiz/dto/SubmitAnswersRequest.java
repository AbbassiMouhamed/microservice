package com.smartlingua.quiz.dto;

import java.util.List;

public record SubmitAnswersRequest(
        List<AnswerSubmission> answers
) {
    public record AnswerSubmission(
            Long questionId,
            String selectedAnswer
    ) {}
}
