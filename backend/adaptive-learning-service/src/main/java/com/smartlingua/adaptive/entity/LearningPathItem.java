package com.smartlingua.adaptive.entity;

import com.smartlingua.adaptive.entity.enums.LearningPathItemStatus;
import com.smartlingua.adaptive.entity.enums.LearningPathItemType;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "al_learning_path_item")
public class LearningPathItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "learning_path_id", nullable = false)
    private LearningPath learningPath;

    @Column(name = "item_id", nullable = false)
    private Long itemId;

    @Enumerated(EnumType.STRING)
    @Column(name = "item_type", nullable = false, length = 20)
    private LearningPathItemType itemType;

    @Column(name = "recommended_order", nullable = false)
    private Integer recommendedOrder;

    @Column(name = "priority_score", nullable = false)
    private Integer priorityScore = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LearningPathItemStatus status = LearningPathItemStatus.PENDING;

    @Column(name = "source_course_id")
    private Long sourceCourseId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
        if (priorityScore == null) priorityScore = 0;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LearningPath getLearningPath() { return learningPath; }
    public void setLearningPath(LearningPath learningPath) { this.learningPath = learningPath; }
    public Long getItemId() { return itemId; }
    public void setItemId(Long itemId) { this.itemId = itemId; }
    public LearningPathItemType getItemType() { return itemType; }
    public void setItemType(LearningPathItemType itemType) { this.itemType = itemType; }
    public Integer getRecommendedOrder() { return recommendedOrder; }
    public void setRecommendedOrder(Integer recommendedOrder) { this.recommendedOrder = recommendedOrder; }
    public Integer getPriorityScore() { return priorityScore; }
    public void setPriorityScore(Integer priorityScore) { this.priorityScore = priorityScore; }
    public LearningPathItemStatus getStatus() { return status; }
    public void setStatus(LearningPathItemStatus status) { this.status = status; }
    public Long getSourceCourseId() { return sourceCourseId; }
    public void setSourceCourseId(Long sourceCourseId) { this.sourceCourseId = sourceCourseId; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
