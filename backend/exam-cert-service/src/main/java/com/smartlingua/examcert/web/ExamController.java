package com.smartlingua.examcert.web;

import com.smartlingua.examcert.domain.ExamAttemptEntity;
import com.smartlingua.examcert.domain.ExamEntity;
import com.smartlingua.examcert.domain.ExamStatus;
import com.smartlingua.examcert.domain.SkillLevel;
import com.smartlingua.examcert.service.ExamService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/exams")
public class ExamController {

    private final ExamService examService;

    public ExamController(ExamService examService) {
        this.examService = examService;
    }

    @GetMapping
    public List<ExamResponse> list() {
        return examService.listExams().stream().map(ExamResponse::from).toList();
    }

    @GetMapping("/{id}")
    public ExamResponse get(@PathVariable("id") UUID id) {
        return ExamResponse.from(examService.getExam(id));
    }

    @PostMapping
    public ExamResponse create(@RequestBody @Valid CreateExamRequest req) {
        ExamEntity exam = examService.createExam(
                new ExamService.CreateExamCommand(
                        req.courseId(),
                        req.title(),
                        req.scheduledAt(),
                        req.durationMinutes(),
                        req.maxScore(),
                        req.passingScore()
                )
        );
        return ExamResponse.from(exam);
    }

    @PutMapping("/{id}/publish")
    public ExamResponse publish(@PathVariable("id") UUID id) {
        return ExamResponse.from(examService.publish(id));
    }

    @PutMapping("/{id}/close")
    public ExamResponse close(@PathVariable("id") UUID id) {
        return ExamResponse.from(examService.close(id));
    }

    @GetMapping("/{id}/attempts")
    public List<ExamAttemptResponse> listAttempts(@PathVariable("id") UUID id) {
        return examService.listAttempts(id).stream().map(ExamAttemptResponse::from).toList();
    }

    @PostMapping("/{id}/attempts")
    public ExamAttemptResponse submitAttempt(@PathVariable("id") UUID id, @RequestBody @Valid SubmitAttemptRequest req) {
        ExamAttemptEntity attempt = examService.submitAttempt(new ExamService.SubmitAttemptCommand(id, req.studentId(), req.score()));
        return ExamAttemptResponse.from(attempt);
    }

    public record CreateExamRequest(
            @NotNull UUID courseId,
            @NotBlank String title,
            OffsetDateTime scheduledAt,
            @Min(1) int durationMinutes,
            @Min(1) int maxScore,
            @Min(0) int passingScore
    ) {
    }

    public record SubmitAttemptRequest(@NotNull UUID studentId, @Min(0) @Max(1000) int score) {
    }

    public record ExamResponse(
            UUID id,
            UUID courseId,
            String title,
            OffsetDateTime scheduledAt,
            int durationMinutes,
            int maxScore,
            int passingScore,
            ExamStatus status
    ) {
        static ExamResponse from(ExamEntity e) {
            return new ExamResponse(
                    e.getId(),
                    e.getCourse().getId(),
                    e.getTitle(),
                    e.getScheduledAt(),
                    e.getDurationMinutes(),
                    e.getMaxScore(),
                    e.getPassingScore(),
                    e.getStatus()
            );
        }
    }

    public record ExamAttemptResponse(
            UUID id,
            UUID examId,
            UUID studentId,
            int score,
            boolean passed,
            SkillLevel skillLevel,
            OffsetDateTime submittedAt
    ) {
        static ExamAttemptResponse from(ExamAttemptEntity a) {
            return new ExamAttemptResponse(
                    a.getId(),
                    a.getExam().getId(),
                    a.getStudent().getId(),
                    a.getScore(),
                    a.isPassed(),
                    a.getSkillLevel(),
                    a.getSubmittedAt()
            );
        }
    }
}
