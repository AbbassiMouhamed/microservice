package com.smartlingua.adaptive.entity;

import com.smartlingua.adaptive.entity.enums.CourseLevel;
import com.smartlingua.adaptive.entity.enums.LearningPathStatus;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "al_learning_path")
public class LearningPath {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 500)
    private String goal = "";

    @Enumerated(EnumType.STRING)
    @Column(name = "target_level", nullable = false, length = 10)
    private CourseLevel targetLevel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LearningPathStatus status = LearningPathStatus.DRAFT;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @OneToMany(mappedBy = "learningPath", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<LearningPathItem> items = new ArrayList<>();

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
        if (updatedAt == null) updatedAt = Instant.now();
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getGoal() { return goal; }
    public void setGoal(String goal) { this.goal = goal; }
    public CourseLevel getTargetLevel() { return targetLevel; }
    public void setTargetLevel(CourseLevel targetLevel) { this.targetLevel = targetLevel; }
    public LearningPathStatus getStatus() { return status; }
    public void setStatus(LearningPathStatus status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    public List<LearningPathItem> getItems() { return items; }
    public void setItems(List<LearningPathItem> items) { this.items = items; }
}
