package com.smartlingua.examcert.service;

import com.smartlingua.examcert.domain.CourseEntity;
import com.smartlingua.examcert.domain.ExamAttemptEntity;
import com.smartlingua.examcert.domain.ExamEntity;
import com.smartlingua.examcert.domain.ExamStatus;
import com.smartlingua.examcert.domain.UserEntity;
import com.smartlingua.examcert.domain.UserType;
import com.smartlingua.examcert.repo.CourseRepository;
import com.smartlingua.examcert.repo.ExamAttemptRepository;
import com.smartlingua.examcert.repo.ExamRepository;
import com.smartlingua.examcert.repo.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@Service
public class ExamService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final ExamRepository examRepository;
    private final ExamAttemptRepository examAttemptRepository;
    private final SkillLevelCalculator skillLevelCalculator;

    public ExamService(
            CourseRepository courseRepository,
            UserRepository userRepository,
            ExamRepository examRepository,
            ExamAttemptRepository examAttemptRepository,
            SkillLevelCalculator skillLevelCalculator
    ) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.examRepository = examRepository;
        this.examAttemptRepository = examAttemptRepository;
        this.skillLevelCalculator = skillLevelCalculator;
    }

    public List<ExamEntity> listExams() {
        return examRepository.findAll();
    }

    public ExamEntity getExam(UUID examId) {
        return examRepository.findById(examId)
                .orElseThrow(() -> new NotFoundException("Exam not found"));
    }

    @Transactional
    public ExamEntity createExam(CreateExamCommand cmd) {
        CourseEntity course = courseRepository.findById(cmd.courseId())
                .orElseThrow(() -> new NotFoundException("Course not found"));

        if (cmd.durationMinutes() <= 0) {
            throw new BadRequestException("durationMinutes must be > 0");
        }
        if (cmd.maxScore() <= 0) {
            throw new BadRequestException("maxScore must be > 0");
        }
        if (cmd.passingScore() < 0 || cmd.passingScore() > cmd.maxScore()) {
            throw new BadRequestException("passingScore must be between 0 and maxScore");
        }

        ExamEntity exam = ExamEntity.builder()
                .id(UUID.randomUUID())
                .course(course)
                .title(cmd.title())
                .scheduledAt(cmd.scheduledAt())
                .durationMinutes(cmd.durationMinutes())
                .maxScore(cmd.maxScore())
                .passingScore(cmd.passingScore())
                .status(ExamStatus.DRAFT)
                .build();

        return examRepository.save(exam);
    }

    @Transactional
    public ExamEntity publish(UUID examId) {
        ExamEntity exam = getExam(examId);
        if (exam.getStatus() == ExamStatus.CLOSED) {
            throw new BadRequestException("Exam is closed");
        }
        exam.setStatus(ExamStatus.PUBLISHED);
        return examRepository.save(exam);
    }

    @Transactional
    public ExamEntity close(UUID examId) {
        ExamEntity exam = getExam(examId);
        exam.setStatus(ExamStatus.CLOSED);
        return examRepository.save(exam);
    }

    @Transactional
    public ExamAttemptEntity submitAttempt(SubmitAttemptCommand cmd) {
        ExamEntity exam = getExam(cmd.examId());
        if (exam.getStatus() != ExamStatus.PUBLISHED) {
            throw new BadRequestException("Exam must be PUBLISHED to accept attempts");
        }

        UserEntity student = userRepository.findById(cmd.studentId())
                .orElseThrow(() -> new NotFoundException("Student not found"));
        if (student.getUserType() != UserType.STUDENT) {
            throw new BadRequestException("userType must be STUDENT");
        }

        if (cmd.score() < 0 || cmd.score() > exam.getMaxScore()) {
            throw new BadRequestException("score must be between 0 and maxScore");
        }

        if (examAttemptRepository.findByExam_IdAndStudent_Id(exam.getId(), student.getId()).isPresent()) {
            throw new BadRequestException("Student already submitted an attempt for this exam");
        }

        boolean passed = cmd.score() >= exam.getPassingScore();
        var skillLevel = skillLevelCalculator.fromScore(cmd.score(), exam.getMaxScore());

        ExamAttemptEntity attempt = ExamAttemptEntity.builder()
                .id(UUID.randomUUID())
                .exam(exam)
                .student(student)
                .score(cmd.score())
                .passed(passed)
                .skillLevel(skillLevel)
                .submittedAt(OffsetDateTime.now(ZoneOffset.UTC))
                .build();

        return examAttemptRepository.save(attempt);
    }

    public List<ExamAttemptEntity> listAttempts(UUID examId) {
        return examAttemptRepository.findByExam_Id(examId);
    }

    public ExamAttemptEntity getAttempt(UUID attemptId) {
        return examAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new NotFoundException("Exam attempt not found"));
    }

    public record CreateExamCommand(
            UUID courseId,
            String title,
            OffsetDateTime scheduledAt,
            int durationMinutes,
            int maxScore,
            int passingScore
    ) {
    }

    public record SubmitAttemptCommand(
            UUID examId,
            UUID studentId,
            int score
    ) {
    }
}
