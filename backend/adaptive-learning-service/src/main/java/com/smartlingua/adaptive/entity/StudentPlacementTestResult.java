package com.smartlingua.adaptive.entity;

import com.smartlingua.adaptive.entity.enums.CourseLevel;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "al_student_placement_test_result")
public class StudentPlacementTestResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(nullable = false)
    private Integer score;

    @Column(name = "score_percent", nullable = false)
    private Integer scorePercent;

    @Enumerated(EnumType.STRING)
    @Column(name = "assigned_level", nullable = false, length = 10)
    private CourseLevel assignedLevel;

    @Column(name = "weak_areas", length = 500)
    private String weakAreas;

    @Column(name = "test_date", nullable = false)
    private Instant testDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        if (testDate == null) testDate = Instant.now();
        if (createdAt == null) createdAt = Instant.now();
        if (scorePercent == null && score != null) scorePercent = score;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
    public Integer getScorePercent() { return scorePercent; }
    public void setScorePercent(Integer scorePercent) { this.scorePercent = scorePercent; }
    public CourseLevel getAssignedLevel() { return assignedLevel; }
    public void setAssignedLevel(CourseLevel assignedLevel) { this.assignedLevel = assignedLevel; }
    public String getWeakAreas() { return weakAreas; }
    public void setWeakAreas(String weakAreas) { this.weakAreas = weakAreas; }
    public Instant getTestDate() { return testDate; }
    public void setTestDate(Instant testDate) { this.testDate = testDate; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
