package com.smartlingua.quiz.service;

import com.smartlingua.quiz.domain.*;
import com.smartlingua.quiz.dto.AttemptResultDto;
import com.smartlingua.quiz.dto.SubmitAnswersRequest;
import com.smartlingua.quiz.repository.AttemptRepository;
import com.smartlingua.quiz.repository.QuestionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class AttemptService {

    private final AttemptRepository attemptRepo;
    private final QuestionRepository questionRepo;

    public AttemptService(AttemptRepository attemptRepo, QuestionRepository questionRepo) {
        this.attemptRepo = attemptRepo;
        this.questionRepo = questionRepo;
    }

    public AttemptResultDto start(String keycloakSubject) {
        LevelFinalAttempt attempt = new LevelFinalAttempt();
        attempt.setKeycloakSubject(keycloakSubject);
        attempt = attemptRepo.save(attempt);
        return toDto(attempt);
    }

    public AttemptResultDto complete(Long attemptId, String keycloakSubject, SubmitAnswersRequest request) {
        LevelFinalAttempt attempt = attemptRepo.findByIdAndKeycloakSubject(attemptId, keycloakSubject)
                .orElseThrow(() -> new IllegalArgumentException("Attempt not found: " + attemptId));

        if (attempt.getStatus() == AttemptStatus.COMPLETED) {
            throw new IllegalStateException("Attempt already completed");
        }

        // Grade answers
        Map<Long, Question> questionsById = questionRepo.findAllById(
                request.answers().stream().map(SubmitAnswersRequest.AnswerSubmission::questionId).toList()
        ).stream().collect(Collectors.toMap(Question::getId, q -> q));

        int correct = 0;
        Map<String, Integer> wrongBySkill = new java.util.HashMap<>();

        for (SubmitAnswersRequest.AnswerSubmission sub : request.answers()) {
            Question q = questionsById.get(sub.questionId());
            if (q == null) continue;

            boolean isCorrect = q.getCorrectAnswer().equalsIgnoreCase(sub.selectedAnswer());

            AttemptAnswer answer = new AttemptAnswer();
            answer.setAttempt(attempt);
            answer.setQuestion(q);
            answer.setSelectedAnswer(sub.selectedAnswer());
            answer.setCorrect(isCorrect);
            attempt.getAnswers().add(answer);

            if (isCorrect) {
                correct++;
            } else {
                wrongBySkill.merge(q.getSkillType(), 1, Integer::sum);
            }
        }

        int total = request.answers().size();
        double score = total > 0 ? (correct * 100.0 / total) : 0;

        // Determine weak areas (skills with most wrong answers)
        String weakAreas = wrongBySkill.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(3)
                .map(Map.Entry::getKey)
                .collect(Collectors.joining(", "));

        attempt.setStatus(AttemptStatus.COMPLETED);
        attempt.setScorePercent(Math.round(score * 100.0) / 100.0);
        attempt.setWeakAreasAuto(weakAreas.isEmpty() ? null : weakAreas);
        attempt.setCompletedAt(Instant.now());

        return toDto(attemptRepo.save(attempt));
    }

    @Transactional(readOnly = true)
    public AttemptResultDto getResult(Long attemptId, String keycloakSubject) {
        return toDto(attemptRepo.findByIdAndKeycloakSubject(attemptId, keycloakSubject)
                .orElseThrow(() -> new IllegalArgumentException("Attempt not found: " + attemptId)));
    }

    @Transactional(readOnly = true)
    public List<AttemptResultDto> getMyAttempts(String keycloakSubject) {
        return attemptRepo.findByKeycloakSubject(keycloakSubject).stream()
                .map(this::toDto).toList();
    }

    private AttemptResultDto toDto(LevelFinalAttempt a) {
        int correctCount = (int) a.getAnswers().stream().filter(AttemptAnswer::isCorrect).count();
        return new AttemptResultDto(a.getId(), a.getStatus().name(), a.getScorePercent(),
                a.getWeakAreasAuto(), a.getStartedAt(), a.getCompletedAt(),
                a.getAnswers().size(), correctCount);
    }
}
