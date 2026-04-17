package com.smartlingua.adaptive.dto;

import com.smartlingua.adaptive.entity.enums.*;
import java.time.Instant;
import java.util.List;

public final class AdaptiveDtos {
    private AdaptiveDtos() {}

    // ---- Request DTOs ----

    public record MeLevelTestFromQuizRequest(long attemptId) {}

    public record PlacementTestSubmitRequest(int score, String weakAreas) {}

    public record PlacementTestSubmitResponse(
            CourseLevel assignedLevel, String insight, Long profileId) {}

    public record GenerateLearningPathRequest(CourseLevel targetLevel, String goal) {}

    public record UpdateItemStatusRequest(LearningPathItemStatus newStatus) {}

    public record LevelTestSubmitRequest(int score, String weakAreas) {
        public LevelTestSubmitRequest(int score) { this(score, null); }
    }

    public record MeChapterStatusRequest(ChapterProgressStatus newStatus) {}

    // ---- Response / View DTOs ----

    public record RecommendationView(Long id, String itemTitle, String personalizedText,
                                     LearningPathItemType itemType, Long refItemId,
                                     RecommendationSource source, Instant createdAt) {}

    public record LearningPathItemView(Long id, Long itemId, LearningPathItemType itemType,
                                       int recommendedOrder, LearningPathItemStatus status,
                                       String title) {}

    public record LearningPathView(Long id, String title, String goal, CourseLevel targetLevel,
                                   LearningPathStatus status, Instant createdAt,
                                   List<LearningPathItemView> items) {}

    public record ProgressView(Long studentId, int totalItems, int completedItems,
                               double completionPercentage, CourseLevel currentLevel,
                               Instant updatedAt) {}

    public record LevelTestSubmitResponse(boolean passed, CourseLevel newLevel,
                                          String message) {}

    public record ProfileView(Long studentId, CourseLevel currentLevel, CourseLevel targetLevel,
                              PreferredContentType preferredContentType, String preferredDifficulty,
                              String learningGoal, Integer gamificationPoints, String badges,
                              List<AlertView> openAlerts,
                              List<RecommendationView> recommendations,
                              String aiSummary) {}

    public record LevelTestResultSnapshot(Long id, CourseLevel currentLevel, int score,
                                          int scorePercent, boolean passed,
                                          CourseLevel unlockedLevel, String weakAreas,
                                          Instant testDate) {}

    public record AlertView(Long id, Long studentId, String studentName,
                            String reason, DifficultySeverity severity,
                            Instant createdAt) {}

    public record CourseAccessResponse(boolean allowed, String reason) {}

    public record CatalogCourseRow(Long courseId, String title, CourseLevel level,
                                   boolean accessible) {}

    public record CatalogAccessOverviewDto(CourseLevel studentLevel,
                                           List<CatalogCourseRow> courses) {}

    public record LearnerPickerEntry(long id, String fullName, String email) {}

    public record TeacherAdaptiveDashboardDto(long totalStudents, long activePaths,
                                              double avgCompletionPercent,
                                              long openAlerts, long recentRecommendations,
                                              List<AlertView> latestAlerts,
                                              List<RecommendationView> latestRecommendations) {}

    // ---- Learning Plan views ----

    public record LearningPlanContentView(Long contentId, String type, String title,
                                          String url, boolean required) {}

    public record LearningPlanChapterView(Long chapterId, String title, String description,
                                          String skillType, int orderIndex,
                                          ChapterProgressStatus status,
                                          List<LearningPlanContentView> contents) {}

    public record LearningPlanSkillSectionView(String skillType,
                                               List<LearningPlanChapterView> chapters,
                                               double completionPercent) {}

    public record LearningPlanView(Long courseId, String courseTitle, CourseLevel courseLevel,
                                   List<LearningPlanSkillSectionView> skillSections,
                                   double globalCompletionPercent,
                                   boolean finalTestEligible,
                                   String assistantMessage) {}

    public record CourseEnrollmentResultView(Long enrollmentId, Long courseId,
                                            String message) {}
}
