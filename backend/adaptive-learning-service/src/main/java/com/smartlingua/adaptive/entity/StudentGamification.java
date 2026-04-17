package com.smartlingua.adaptive.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "al_student_gamification")
public class StudentGamification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false, unique = true)
    private Long studentId;

    @Column(nullable = false)
    private Integer points = 0;

    @Column(nullable = false)
    private String badges = "";

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "last_promotion_message", length = 1000)
    private String lastPromotionMessage;

    @Column(name = "last_promotion_at")
    private Instant lastPromotionAt;

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
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public Integer getPoints() { return points; }
    public void setPoints(Integer points) { this.points = points; }
    public String getBadges() { return badges; }
    public void setBadges(String badges) { this.badges = badges; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    public String getLastPromotionMessage() { return lastPromotionMessage; }
    public void setLastPromotionMessage(String lastPromotionMessage) { this.lastPromotionMessage = lastPromotionMessage; }
    public Instant getLastPromotionAt() { return lastPromotionAt; }
    public void setLastPromotionAt(Instant lastPromotionAt) { this.lastPromotionAt = lastPromotionAt; }
}
