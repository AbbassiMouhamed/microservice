package com.smartlingua.adaptive.entity;

import com.smartlingua.adaptive.entity.enums.CourseLevel;
import com.smartlingua.adaptive.entity.enums.PreferredContentType;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "al_student_learning_profile")
public class StudentLearningProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false, unique = true)
    private Long studentId;

    @Enumerated(EnumType.STRING)
    @Column(name = "current_level", nullable = false, length = 10)
    private CourseLevel currentLevel = CourseLevel.A1;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_level", nullable = false, length = 10)
    private CourseLevel targetLevel = CourseLevel.A2;

    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_content_type", nullable = false, length = 20)
    private PreferredContentType preferredContentType = PreferredContentType.ANY;

    @Column(name = "difficulty_preference", nullable = false, length = 20)
    private String preferredDifficulty = "MEDIUM";

    @Column(name = "learning_goal", nullable = false, length = 500)
    private String learningGoal = "";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public CourseLevel getCurrentLevel() { return currentLevel; }
    public void setCurrentLevel(CourseLevel currentLevel) { this.currentLevel = currentLevel; }
    public CourseLevel getTargetLevel() { return targetLevel; }
    public void setTargetLevel(CourseLevel targetLevel) { this.targetLevel = targetLevel; }
    public PreferredContentType getPreferredContentType() { return preferredContentType; }
    public void setPreferredContentType(PreferredContentType preferredContentType) { this.preferredContentType = preferredContentType; }
    public String getPreferredDifficulty() { return preferredDifficulty; }
    public void setPreferredDifficulty(String preferredDifficulty) { this.preferredDifficulty = preferredDifficulty; }
    public String getLearningGoal() { return learningGoal; }
    public void setLearningGoal(String learningGoal) { this.learningGoal = learningGoal; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
