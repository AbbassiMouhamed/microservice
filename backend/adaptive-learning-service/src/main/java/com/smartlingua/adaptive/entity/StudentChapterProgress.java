package com.smartlingua.adaptive.entity;

import com.smartlingua.adaptive.entity.enums.ChapterProgressStatus;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "al_student_chapter_progress",
        uniqueConstraints = @UniqueConstraint(columnNames = {"enrollment_id", "chapter_id"}))
public class StudentChapterProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enrollment_id", nullable = false)
    private StudentCourseEnrollment enrollment;

    @Column(name = "chapter_id", nullable = false)
    private Long chapterId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ChapterProgressStatus status = ChapterProgressStatus.NOT_STARTED;

    @Column(name = "completed_at")
    private Instant completedAt;

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

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public StudentCourseEnrollment getEnrollment() { return enrollment; }
    public void setEnrollment(StudentCourseEnrollment enrollment) { this.enrollment = enrollment; }
    public Long getChapterId() { return chapterId; }
    public void setChapterId(Long chapterId) { this.chapterId = chapterId; }
    public ChapterProgressStatus getStatus() { return status; }
    public void setStatus(ChapterProgressStatus status) { this.status = status; }
    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
