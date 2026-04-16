package com.smartlingua.examcert.web;

import com.smartlingua.examcert.domain.ExamAttemptEntity;
import com.smartlingua.examcert.domain.SkillLevel;
import com.smartlingua.examcert.service.ExamService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/attempts")
public class AttemptController {

    private final ExamService examService;

    public AttemptController(ExamService examService) {
        this.examService = examService;
    }

    @GetMapping("/{id}")
    public AttemptResponse get(@PathVariable("id") UUID id) {
        ExamAttemptEntity attempt = examService.getAttempt(id);
        return AttemptResponse.from(attempt);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable("id") UUID id) {
        examService.deleteAttempt(id);
    }

    public record AttemptResponse(
            UUID id,
            UUID examId,
            UUID studentId,
            int score,
            boolean passed,
            SkillLevel skillLevel,
            OffsetDateTime submittedAt
    ) {
        static AttemptResponse from(ExamAttemptEntity a) {
            return new AttemptResponse(
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
