package com.smartlingua.quiz.repository;

import com.smartlingua.quiz.domain.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByLevel(String level);
    List<Question> findBySkillType(String skillType);
    List<Question> findByLevelAndSkillType(String level, String skillType);
}
