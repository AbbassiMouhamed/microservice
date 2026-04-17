package com.smartlingua.quiz.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quiz_level_final_attempts")
public class LevelFinalAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "keycloak_subject", nullable = false, length = 36)
    private String keycloakSubject;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AttemptStatus status = AttemptStatus.IN_PROGRESS;

    @Column(name = "score_percent")
    private Double scorePercent;

    @Column(name = "weak_areas_auto", length = 1000)
    private String weakAreasAuto;

    @Column(name = "started_at", nullable = false, updatable = false)
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @OneToMany(mappedBy = "attempt", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AttemptAnswer> answers = new ArrayList<>();

    @PrePersist
    void onPersist() {
        startedAt = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getKeycloakSubject() { return keycloakSubject; }
    public void setKeycloakSubject(String keycloakSubject) { this.keycloakSubject = keycloakSubject; }
    public AttemptStatus getStatus() { return status; }
    public void setStatus(AttemptStatus status) { this.status = status; }
    public Double getScorePercent() { return scorePercent; }
    public void setScorePercent(Double scorePercent) { this.scorePercent = scorePercent; }
    public String getWeakAreasAuto() { return weakAreasAuto; }
    public void setWeakAreasAuto(String weakAreasAuto) { this.weakAreasAuto = weakAreasAuto; }
    public Instant getStartedAt() { return startedAt; }
    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }
    public List<AttemptAnswer> getAnswers() { return answers; }
}
