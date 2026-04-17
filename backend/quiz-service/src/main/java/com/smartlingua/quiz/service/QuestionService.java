package com.smartlingua.quiz.service;

import com.smartlingua.quiz.domain.Question;
import com.smartlingua.quiz.dto.QuestionDto;
import com.smartlingua.quiz.repository.QuestionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class QuestionService {

    private final QuestionRepository questionRepo;

    public QuestionService(QuestionRepository questionRepo) {
        this.questionRepo = questionRepo;
    }

    @Transactional(readOnly = true)
    public List<QuestionDto> findAll(String level, String skillType) {
        List<Question> questions;
        if (level != null && skillType != null) {
            questions = questionRepo.findByLevelAndSkillType(level, skillType);
        } else if (level != null) {
            questions = questionRepo.findByLevel(level);
        } else if (skillType != null) {
            questions = questionRepo.findBySkillType(skillType);
        } else {
            questions = questionRepo.findAll();
        }
        return questions.stream().map(this::toDto).toList();
    }

    public QuestionDto create(QuestionDto dto) {
        Question q = new Question();
        applyDto(q, dto);
        return toDto(questionRepo.save(q));
    }

    public QuestionDto update(Long id, QuestionDto dto) {
        Question q = questionRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Question not found: " + id));
        applyDto(q, dto);
        return toDto(questionRepo.save(q));
    }

    public void delete(Long id) {
        questionRepo.deleteById(id);
    }

    private void applyDto(Question q, QuestionDto dto) {
        q.setQuestionText(dto.questionText());
        q.setLevel(dto.level());
        q.setSkillType(dto.skillType());
        q.setCorrectAnswer(dto.correctAnswer());
        q.setOptionA(dto.optionA());
        q.setOptionB(dto.optionB());
        q.setOptionC(dto.optionC());
        q.setOptionD(dto.optionD());
    }

    private QuestionDto toDto(Question q) {
        return new QuestionDto(q.getId(), q.getQuestionText(), q.getLevel(), q.getSkillType(),
                q.getCorrectAnswer(), q.getOptionA(), q.getOptionB(), q.getOptionC(), q.getOptionD());
    }
}
