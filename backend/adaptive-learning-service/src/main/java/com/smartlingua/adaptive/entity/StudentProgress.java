package com.smartlingua.adaptive.entity;

import com.smartlingua.adaptive.entity.enums.CourseLevel;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "al_student_progress")
public class StudentProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "learning_path_id", nullable = false)
    private Long learningPathId;

    @Column(name = "total_items", nullable = false)
    private Integer totalItems;

    @Column(name = "total_lessons", nullable = false)
    private Integer totalLessons = 0;

    @Column(name = "completed_items", nullable = false)
    private Integer completedItems = 0;

    @Column(name = "completed_lessons", nullable = false)
    private Integer completedLessons = 0;

    @Column(name = "completion_percentage", nullable = false)
    private Double completionPercentage = 0.0;

    @Column(name = "completion_percent", nullable = false)
    private Double completionPercent = 0.0;

    @Enumerated(EnumType.STRING)
    @Column(name = "current_level", nullable = false, length = 10)
    private CourseLevel currentLevel;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void prePersist() {
        if (updatedAt == null) updatedAt = Instant.now();
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    // Sync dual fields
    public void setTotalItems(Integer totalItems) {
        this.totalItems = totalItems;
        this.totalLessons = totalItems;
    }
    public void setCompletedItems(Integer completedItems) {
        this.completedItems = completedItems;
        this.completedLessons = completedItems;
    }
    public void setCompletionPercentage(Double completionPercentage) {
        this.completionPercentage = completionPercentage;
        this.completionPercent = completionPercentage;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public Long getLearningPathId() { return learningPathId; }
    public void setLearningPathId(Long learningPathId) { this.learningPathId = learningPathId; }
    public Integer getTotalItems() { return totalItems; }
    public Integer getTotalLessons() { return totalLessons; }
    public void setTotalLessons(Integer totalLessons) { this.totalLessons = totalLessons; this.totalItems = totalLessons; }
    public Integer getCompletedItems() { return completedItems; }
    public Integer getCompletedLessons() { return completedLessons; }
    public void setCompletedLessons(Integer completedLessons) { this.completedLessons = completedLessons; this.completedItems = completedLessons; }
    public Double getCompletionPercentage() { return completionPercentage; }
    public Double getCompletionPercent() { return completionPercent; }
    public void setCompletionPercent(Double completionPercent) { this.completionPercent = completionPercent; this.completionPercentage = completionPercent; }
    public CourseLevel getCurrentLevel() { return currentLevel; }
    public void setCurrentLevel(CourseLevel currentLevel) { this.currentLevel = currentLevel; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
