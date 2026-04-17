package com.smartlingua.adaptive.entity;

import com.smartlingua.adaptive.entity.enums.LearningPathItemType;
import com.smartlingua.adaptive.entity.enums.RecommendationSource;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "al_pedagogical_recommendation")
public class PedagogicalRecommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Enumerated(EnumType.STRING)
    @Column(name = "item_type", nullable = false, length = 20)
    private LearningPathItemType itemType;

    @Column(name = "ref_item_id", nullable = false)
    private Long refItemId;

    @Column(name = "course_context_id")
    private Long courseContextId;

    @Column(name = "item_title", nullable = false, length = 120)
    private String itemTitle;

    @Column(name = "personalized_text", nullable = false, length = 2000)
    private String personalizedText;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private RecommendationSource source;

    @Column(nullable = false)
    private boolean active = true;

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
    public LearningPathItemType getItemType() { return itemType; }
    public void setItemType(LearningPathItemType itemType) { this.itemType = itemType; }
    public Long getRefItemId() { return refItemId; }
    public void setRefItemId(Long refItemId) { this.refItemId = refItemId; }
    public Long getCourseContextId() { return courseContextId; }
    public void setCourseContextId(Long courseContextId) { this.courseContextId = courseContextId; }
    public String getItemTitle() { return itemTitle; }
    public void setItemTitle(String itemTitle) { this.itemTitle = itemTitle; }
    public String getPersonalizedText() { return personalizedText; }
    public void setPersonalizedText(String personalizedText) { this.personalizedText = personalizedText; }
    public RecommendationSource getSource() { return source; }
    public void setSource(RecommendationSource source) { this.source = source; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
