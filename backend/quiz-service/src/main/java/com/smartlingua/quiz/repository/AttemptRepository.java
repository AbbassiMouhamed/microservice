package com.smartlingua.quiz.repository;

import com.smartlingua.quiz.domain.LevelFinalAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AttemptRepository extends JpaRepository<LevelFinalAttempt, Long> {
    List<LevelFinalAttempt> findByKeycloakSubject(String keycloakSubject);
    Optional<LevelFinalAttempt> findByIdAndKeycloakSubject(Long id, String keycloakSubject);
}
