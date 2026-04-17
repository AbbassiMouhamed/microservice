package com.smartlingua.adaptive.service;

import com.smartlingua.adaptive.dto.AdaptiveDtos.*;
import com.smartlingua.adaptive.dto.external.*;
import com.smartlingua.adaptive.entity.*;
import com.smartlingua.adaptive.entity.enums.*;
import com.smartlingua.adaptive.exception.NotFoundException;
import com.smartlingua.adaptive.feign.CoursesClient;
import com.smartlingua.adaptive.feign.QuizClient;
import com.smartlingua.adaptive.repository.*;
import com.smartlingua.adaptive.security.AdaptiveAuthorizationService;
import com.smartlingua.adaptive.security.JwtUserResolver;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdaptiveLearningFacadeService {
    private static final Logger log = LoggerFactory.getLogger(AdaptiveLearningFacadeService.class);

    private final CoursesClient coursesClient;
    private final QuizClient quizClient;
    private final StudentLearningProfileRepository profileRepo;
    private final StudentPlacementTestResultRepository placementRepo;
    private final LearningPathRepository pathRepo;
    private final LearningPathItemRepository pathItemRepo;
    private final StudentProgressRepository progressRepo;
    private final StudentGamificationRepository gamificationRepo;
    private final StudentLevelTestResultRepository levelTestRepo;
    private final StudentCourseEnrollmentRepository enrollmentRepo;
    private final StudentChapterProgressRepository chapterProgressRepo;
    private final LearningDifficultyAlertRepository alertRepo;
    private final PedagogicalRecommendationRepository recRepo;
    private final AdaptivePedagogyService pedagogyService;
    private final AdaptiveDifficultyService difficultyService;
    private final CourseLevelAccessPolicy accessPolicy;
    private final AdaptiveAuthorizationService authService;
    private final JwtUserResolver jwtUserResolver;
    private final AIRecommendationService aiService;

    public AdaptiveLearningFacadeService(
            CoursesClient coursesClient,
            QuizClient quizClient,
            StudentLearningProfileRepository profileRepo,
            StudentPlacementTestResultRepository placementRepo,
            LearningPathRepository pathRepo,
            LearningPathItemRepository pathItemRepo,
            StudentProgressRepository progressRepo,
            StudentGamificationRepository gamificationRepo,
            StudentLevelTestResultRepository levelTestRepo,
            StudentCourseEnrollmentRepository enrollmentRepo,
            StudentChapterProgressRepository chapterProgressRepo,
            LearningDifficultyAlertRepository alertRepo,
            PedagogicalRecommendationRepository recRepo,
            AdaptivePedagogyService pedagogyService,
            AdaptiveDifficultyService difficultyService,
            CourseLevelAccessPolicy accessPolicy,
            AdaptiveAuthorizationService authService,
            JwtUserResolver jwtUserResolver,
            AIRecommendationService aiService) {
        this.coursesClient = coursesClient;
        this.quizClient = quizClient;
        this.profileRepo = profileRepo;
        this.placementRepo = placementRepo;
        this.pathRepo = pathRepo;
        this.pathItemRepo = pathItemRepo;
        this.progressRepo = progressRepo;
        this.gamificationRepo = gamificationRepo;
        this.levelTestRepo = levelTestRepo;
        this.enrollmentRepo = enrollmentRepo;
        this.chapterProgressRepo = chapterProgressRepo;
        this.alertRepo = alertRepo;
        this.recRepo = recRepo;
        this.pedagogyService = pedagogyService;
        this.difficultyService = difficultyService;
        this.accessPolicy = accessPolicy;
        this.authService = authService;
        this.jwtUserResolver = jwtUserResolver;
        this.aiService = aiService;
    }

    // ============================================================
    // PLACEMENT TEST
    // ============================================================

    @Transactional
    public PlacementTestSubmitResponse submitPlacementTest(Long studentId,
                                                          PlacementTestSubmitRequest req) {
        CourseLevel assignedLevel = determineLevelFromScore(req.score());

        StudentPlacementTestResult result = new StudentPlacementTestResult();
        result.setStudentId(studentId);
        result.setScore(req.score());
        result.setScorePercent(req.score());
        result.setAssignedLevel(assignedLevel);
        result.setWeakAreas(req.weakAreas());
        placementRepo.save(result);

        StudentLearningProfile profile = profileRepo.findByStudentId(studentId)
                .orElseGet(() -> {
                    StudentLearningProfile p = new StudentLearningProfile();
                    p.setStudentId(studentId);
                    return p;
                });
        profile.setCurrentLevel(assignedLevel);
        CourseLevel target = nextLevel(assignedLevel);
        profile.setTargetLevel(target);
        profileRepo.save(profile);

        awardPoints(studentId, 10, "Placement test completed");

        try {
            List<CourseExternalDto> courses = coursesClient.getAllCourses(null);
            pedagogyService.buildRecommendationsAfterLevel(studentId, assignedLevel, courses);
        } catch (Exception e) {
            log.warn("Could not build post-placement recommendations: {}", e.getMessage());
        }

        String insight = "You have been placed at level " + assignedLevel
                + ". Target: " + target;
        return new PlacementTestSubmitResponse(assignedLevel, insight, profile.getId());
    }

    // ============================================================
    // LEARNING PATH
    // ============================================================

    @Transactional
    public LearningPathView generateLearningPath(Long studentId,
                                                 GenerateLearningPathRequest req) {
        StudentLearningProfile profile = profileRepo.findByStudentId(studentId)
                .orElseThrow(() -> new NotFoundException("Profile not found for student " + studentId));

        CourseLevel target = req.targetLevel() != null ? req.targetLevel() : profile.getTargetLevel();
        String goal = req.goal() != null && !req.goal().isBlank() ? req.goal() : "Reach " + target;

        LearningPath path = new LearningPath();
        path.setStudentId(studentId);
        path.setTitle("Path to " + target);
        path.setGoal(goal);
        path.setTargetLevel(target);
        path.setStatus(LearningPathStatus.ACTIVE);
        pathRepo.save(path);

        List<CourseExternalDto> courses;
        try {
            courses = coursesClient.getAllCourses(null);
        } catch (Exception e) {
            log.warn("Cannot fetch courses: {}", e.getMessage());
            courses = List.of();
        }

        int order = 1;
        for (CourseExternalDto c : courses) {
            if (c.getLevel() == null) continue;
            if (c.getLevel().ordinal() >= profile.getCurrentLevel().ordinal()
                    && c.getLevel().ordinal() <= target.ordinal()) {
                LearningPathItem item = new LearningPathItem();
                item.setLearningPath(path);
                item.setItemId(c.getId());
                item.setItemType(LearningPathItemType.COURSE);
                item.setRecommendedOrder(order++);
                item.setStatus(LearningPathItemStatus.PENDING);
                item.setSourceCourseId(c.getId());
                path.getItems().add(item);
            }
        }
        pathRepo.save(path);

        // Create initial progress record
        StudentProgress progress = new StudentProgress();
        progress.setStudentId(studentId);
        progress.setLearningPathId(path.getId());
        progress.setTotalItems(path.getItems().size());
        progress.setCompletedItems(0);
        progress.setCompletionPercentage(0.0);
        progress.setCurrentLevel(profile.getCurrentLevel());
        progressRepo.save(progress);

        awardPoints(studentId, 5, "Learning path created");

        return toLearningPathView(path);
    }

    @Transactional(readOnly = true)
    public LearningPathView getLatestLearningPath(Long studentId) {
        return pathRepo.findFirstByStudentIdOrderByCreatedAtDesc(studentId)
                .map(path -> {
                    List<LearningPathItem> items = pathItemRepo.findByLearningPath_IdOrderByRecommendedOrderAsc(path.getId());
                    path.setItems(items);
                    return toLearningPathView(path);
                })
                .orElse(null);
    }

    @Transactional
    public LearningPathItemView updateItemStatus(Long studentId, Long itemId,
                                                 UpdateItemStatusRequest req) {
        LearningPathItem item = pathItemRepo.findById(itemId)
                .orElseThrow(() -> new NotFoundException("Item not found: " + itemId));
        item.setStatus(req.newStatus());
        pathItemRepo.save(item);

        // Update progress if completed
        if (req.newStatus() == LearningPathItemStatus.DONE) {
            updateProgressAfterCompletion(studentId, item.getLearningPath().getId());
            awardPoints(studentId, 3, "Item completed");
        }

        return toLearningPathItemView(item);
    }

    // ============================================================
    // LEVEL TEST
    // ============================================================

    @Transactional
    public LevelTestSubmitResponse submitLevelTest(Long studentId,
                                                   LevelTestSubmitRequest req) {
        StudentLearningProfile profile = profileRepo.findByStudentId(studentId)
                .orElseThrow(() -> new NotFoundException("Profile not found"));

        boolean passed = req.score() >= 70;
        CourseLevel currentLevel = profile.getCurrentLevel();
        CourseLevel newLevel = passed ? nextLevel(currentLevel) : currentLevel;

        StudentLevelTestResult result = new StudentLevelTestResult();
        result.setStudentId(studentId);
        result.setCurrentLevel(currentLevel);
        result.setScore(req.score());
        result.setScorePercent(req.score());
        result.setPassed(passed);
        result.setUnlockedLevel(newLevel);
        result.setWeakAreas(req.weakAreas());
        levelTestRepo.save(result);

        if (passed) {
            profile.setCurrentLevel(newLevel);
            profile.setTargetLevel(nextLevel(newLevel));
            profileRepo.save(profile);

            awardPoints(studentId, 20, "Level test passed");

            String msg = aiService.getLevelPromotionMessage(currentLevel.name(), newLevel.name());
            StudentGamification g = gamificationRepo.findByStudentId(studentId).orElse(null);
            if (g != null) {
                g.setLastPromotionMessage(msg);
                g.setLastPromotionAt(Instant.now());
                gamificationRepo.save(g);
            }

            try {
                List<CourseExternalDto> courses = coursesClient.getAllCourses(null);
                pedagogyService.buildRecommendationsAfterLevel(studentId, newLevel, courses);
            } catch (Exception e) {
                log.warn("Post-level-test recommendations failed: {}", e.getMessage());
            }
        } else {
            awardPoints(studentId, 2, "Level test attempted");
        }

        String message = passed
                ? "Congratulations! You advanced to " + newLevel
                : "Keep studying. Score needed: 70%, your score: " + req.score() + "%";
        return new LevelTestSubmitResponse(passed, newLevel, message);
    }

    @Transactional
    public LevelTestSubmitResponse submitLevelTestFromQuiz(Long studentId,
                                                          MeLevelTestFromQuizRequest req) {
        if (levelTestRepo.existsByQuizAttemptId(req.attemptId())) {
            throw new IllegalStateException("This quiz attempt was already processed");
        }
        QuizLevelFinalResultDto quizResult;
        try {
            quizResult = quizClient.getLevelFinalAttempt(req.attemptId());
        } catch (Exception e) {
            throw new IllegalStateException("Could not fetch quiz attempt: " + e.getMessage());
        }
        if (!quizResult.isCompleted()) {
            throw new IllegalStateException("Quiz attempt is not completed yet");
        }

        StudentLearningProfile profile = profileRepo.findByStudentId(studentId)
                .orElseThrow(() -> new NotFoundException("Profile not found"));

        boolean passed = quizResult.isPassed();
        CourseLevel currentLevel = profile.getCurrentLevel();
        CourseLevel newLevel = passed ? nextLevel(currentLevel) : currentLevel;

        StudentLevelTestResult result = new StudentLevelTestResult();
        result.setStudentId(studentId);
        result.setCurrentLevel(currentLevel);
        result.setScore(quizResult.getScorePercent());
        result.setScorePercent(quizResult.getScorePercent());
        result.setPassed(passed);
        result.setUnlockedLevel(newLevel);
        result.setWeakAreas(quizResult.getWeakAreasAuto());
        result.setQuizAttemptId(req.attemptId());
        levelTestRepo.save(result);

        if (passed) {
            profile.setCurrentLevel(newLevel);
            profile.setTargetLevel(nextLevel(newLevel));
            profileRepo.save(profile);
            awardPoints(studentId, 20, "Quiz level test passed");
        } else {
            awardPoints(studentId, 2, "Quiz level test attempted");
        }

        String message = passed
                ? "Congratulations! You advanced to " + newLevel
                : "Keep studying. Score: " + quizResult.getScorePercent() + "%";
        return new LevelTestSubmitResponse(passed, newLevel, message);
    }

    // ============================================================
    // PROFILE
    // ============================================================

    @Transactional
    public ProfileView getProfile(Long studentId) {
        StudentLearningProfile profile = profileRepo.findByStudentId(studentId)
                .orElseGet(() -> {
                    StudentLearningProfile p = new StudentLearningProfile();
                    p.setStudentId(studentId);
                    return profileRepo.save(p);
                });

        StudentGamification g = gamificationRepo.findByStudentId(studentId).orElse(null);
        int points = g != null ? g.getPoints() : 0;
        String badges = g != null ? g.getBadges() : "";

        List<AlertView> openAlerts = alertRepo.findByStudentIdAndResolvedFalseOrderByCreatedAtDesc(studentId)
                .stream().map(this::toAlertView).collect(Collectors.toList());

        List<RecommendationView> recs = recRepo.findByStudentIdAndActiveTrueOrderByCreatedAtDesc(studentId)
                .stream().map(this::toRecommendationView).collect(Collectors.toList());

        String aiSummary = aiService.getProfileSummary(
                profile.getCurrentLevel().name(),
                profile.getLearningGoal(),
                points);

        return new ProfileView(studentId, profile.getCurrentLevel(), profile.getTargetLevel(),
                profile.getPreferredContentType(), profile.getPreferredDifficulty(),
                profile.getLearningGoal(), points, badges, openAlerts, recs, aiSummary);
    }

    @Transactional(readOnly = true)
    public ProgressView getProgress(Long studentId) {
        StudentProgress progress = progressRepo.findTopByStudentIdOrderByUpdatedAtDesc(studentId)
                .orElseThrow(() -> new NotFoundException("No progress found for student " + studentId));
        return new ProgressView(studentId, progress.getTotalItems(), progress.getCompletedItems(),
                progress.getCompletionPercentage(), progress.getCurrentLevel(), progress.getUpdatedAt());
    }

    @Transactional(readOnly = true)
    public LevelTestResultSnapshot getLatestLevelTest(Long studentId) {
        StudentLevelTestResult r = levelTestRepo.findTopByStudentIdOrderByTestDateDesc(studentId)
                .orElseThrow(() -> new NotFoundException("No level test found"));
        return new LevelTestResultSnapshot(r.getId(), r.getCurrentLevel(), r.getScore(),
                r.getScorePercent(), r.getPassed(), r.getUnlockedLevel(),
                r.getWeakAreas(), r.getTestDate());
    }

    // ============================================================
    // COURSE ACCESS
    // ============================================================

    @Transactional(readOnly = true)
    public CourseAccessResponse checkCourseAccess(Long studentId, Long courseId) {
        StudentLearningProfile profile = profileRepo.findByStudentId(studentId).orElse(null);
        if (profile == null) {
            return new CourseAccessResponse(false, "No learning profile. Take the placement test first.");
        }
        CourseExternalDto course;
        try {
            course = coursesClient.getCourseById(courseId);
        } catch (Exception e) {
            return new CourseAccessResponse(false, "Course not found");
        }
        if (course.getLevel() == null) {
            return new CourseAccessResponse(true, "Course has no level restriction");
        }
        boolean allowed = accessPolicy.canAccessCourse(profile.getCurrentLevel(), course.getLevel());
        String reason = allowed ? "Access granted" : "Your level " + profile.getCurrentLevel()
                + " does not meet the required " + course.getLevel();
        return new CourseAccessResponse(allowed, reason);
    }

    @Transactional(readOnly = true)
    public CatalogAccessOverviewDto getCatalogOverview(Long studentId) {
        StudentLearningProfile profile = profileRepo.findByStudentId(studentId).orElse(null);
        CourseLevel studentLevel = profile != null ? profile.getCurrentLevel() : CourseLevel.A1;

        List<CourseExternalDto> courses;
        try {
            courses = coursesClient.getAllCourses(null);
        } catch (Exception e) {
            courses = List.of();
        }

        List<CatalogCourseRow> rows = courses.stream()
                .map(c -> new CatalogCourseRow(c.getId(), c.getTitle(), c.getLevel(),
                        c.getLevel() == null || accessPolicy.canAccessCourse(studentLevel, c.getLevel())))
                .collect(Collectors.toList());

        return new CatalogAccessOverviewDto(studentLevel, rows);
    }

    // ============================================================
    // COURSE ENROLLMENT
    // ============================================================

    @Transactional
    public CourseEnrollmentResultView enrollInCourse(Long studentId, Long courseId) {
        Optional<StudentCourseEnrollment> existing =
                enrollmentRepo.findByStudentIdAndCourseIdAndStatus(studentId, courseId, EnrollmentStatus.ACTIVE);
        if (existing.isPresent()) {
            return new CourseEnrollmentResultView(existing.get().getId(), courseId, "Already enrolled");
        }

        CourseAccessResponse access = checkCourseAccess(studentId, courseId);
        if (!access.allowed()) {
            throw new IllegalStateException("Cannot enroll: " + access.reason());
        }

        StudentCourseEnrollment enrollment = new StudentCourseEnrollment();
        enrollment.setStudentId(studentId);
        enrollment.setCourseId(courseId);
        enrollment.setStatus(EnrollmentStatus.ACTIVE);
        enrollmentRepo.save(enrollment);

        awardPoints(studentId, 5, "Enrolled in course");

        return new CourseEnrollmentResultView(enrollment.getId(), courseId, "Successfully enrolled");
    }

    // ============================================================
    // CHAPTER PROGRESS
    // ============================================================

    @Transactional
    public void updateChapterStatus(Long studentId, Long courseId, Long chapterId,
                                    MeChapterStatusRequest req) {
        StudentCourseEnrollment enrollment =
                enrollmentRepo.findByStudentIdAndCourseIdAndStatus(studentId, courseId, EnrollmentStatus.ACTIVE)
                        .orElseThrow(() -> new NotFoundException("No active enrollment for course " + courseId));

        StudentChapterProgress cp = chapterProgressRepo.findByEnrollment_IdAndChapterId(
                        enrollment.getId(), chapterId)
                .orElseGet(() -> {
                    StudentChapterProgress p = new StudentChapterProgress();
                    p.setEnrollment(enrollment);
                    p.setChapterId(chapterId);
                    return p;
                });

        cp.setStatus(req.newStatus());
        if (req.newStatus() == ChapterProgressStatus.COMPLETED && cp.getCompletedAt() == null) {
            cp.setCompletedAt(Instant.now());
            awardPoints(studentId, 2, "Chapter completed");
        }
        chapterProgressRepo.save(cp);
    }

    // ============================================================
    // LEARNING PLAN
    // ============================================================

    @Transactional(readOnly = true)
    public LearningPlanView getLearningPlan(Long studentId, Long courseId) {
        StudentCourseEnrollment enrollment =
                enrollmentRepo.findByStudentIdAndCourseIdAndStatus(studentId, courseId, EnrollmentStatus.ACTIVE)
                        .orElseThrow(() -> new NotFoundException("No active enrollment for course " + courseId));

        CourseExternalDto course;
        List<ChapterExternalDto> chapters;
        try {
            course = coursesClient.getCourseById(courseId);
            chapters = coursesClient.getChaptersByCourse(courseId);
        } catch (Exception e) {
            throw new NotFoundException("Could not load course data: " + e.getMessage());
        }

        List<StudentChapterProgress> allProgress =
                chapterProgressRepo.findByEnrollment_Id(enrollment.getId());
        Map<Long, ChapterProgressStatus> progressMap = allProgress.stream()
                .collect(Collectors.toMap(StudentChapterProgress::getChapterId,
                        StudentChapterProgress::getStatus,
                        (a, b) -> b));

        // Build chapters with status
        List<LearningPlanChapterView> chapterViews = chapters.stream()
                .sorted(Comparator.comparingInt(c -> c.getOrderIndex() != null ? c.getOrderIndex() : 0))
                .map(ch -> {
                    ChapterProgressStatus status = progressMap.getOrDefault(ch.getId(),
                            ChapterProgressStatus.NOT_STARTED);
                    List<LearningPlanContentView> contentViews = ch.getContents() != null
                            ? ch.getContents().stream()
                            .map(cc -> new LearningPlanContentView(cc.getId(), cc.getType(),
                                    cc.getTitle(), cc.getUrl(), cc.isRequired()))
                            .collect(Collectors.toList())
                            : List.of();
                    return new LearningPlanChapterView(ch.getId(), ch.getTitle(), ch.getDescription(),
                            ch.getSkillType(), ch.getOrderIndex() != null ? ch.getOrderIndex() : 0,
                            status, contentViews);
                })
                .collect(Collectors.toList());

        // Group by skill
        Map<String, List<LearningPlanChapterView>> bySkill = chapterViews.stream()
                .collect(Collectors.groupingBy(c -> c.skillType() != null ? c.skillType() : "general",
                        LinkedHashMap::new, Collectors.toList()));

        List<LearningPlanSkillSectionView> sections = bySkill.entrySet().stream()
                .map(e -> {
                    long total = e.getValue().size();
                    long completed = e.getValue().stream()
                            .filter(c -> c.status() == ChapterProgressStatus.COMPLETED).count();
                    double pct = total > 0 ? (completed * 100.0 / total) : 0;
                    return new LearningPlanSkillSectionView(e.getKey(), e.getValue(), pct);
                })
                .collect(Collectors.toList());

        long totalChapters = chapterViews.size();
        long completedChapters = chapterViews.stream()
                .filter(c -> c.status() == ChapterProgressStatus.COMPLETED).count();
        double globalPct = totalChapters > 0 ? (completedChapters * 100.0 / totalChapters) : 0;
        boolean finalTestEligible = globalPct >= 80.0;

        String assistantMsg = finalTestEligible
                ? "You're eligible for the final test! Good luck."
                : String.format("Complete more chapters (%.0f%% done, need 80%%).", globalPct);

        return new LearningPlanView(courseId, course.getTitle(), course.getLevel(),
                sections, globalPct, finalTestEligible, assistantMsg);
    }

    // ============================================================
    // TEACHER DASHBOARD
    // ============================================================

    @Transactional(readOnly = true)
    public TeacherAdaptiveDashboardDto getTeacherDashboard() {
        long totalStudents = profileRepo.count();
        long activePaths = pathRepo.countByStatus(LearningPathStatus.ACTIVE);
        Double avgCompletion = progressRepo.averageCompletionPercentage();
        double avg = avgCompletion != null ? avgCompletion : 0.0;

        long openAlerts = alertRepo.countByResolvedFalse();
        long recentRecs = recRepo.countByCreatedAtAfter(Instant.now().minus(7, ChronoUnit.DAYS));

        List<AlertView> latestAlerts = alertRepo.findTop20ByResolvedFalseOrderByCreatedAtDesc()
                .stream().map(this::toAlertView).collect(Collectors.toList());

        List<RecommendationView> latestRecs = recRepo.findTop15ByActiveTrueOrderByCreatedAtDesc()
                .stream().map(this::toRecommendationView).collect(Collectors.toList());

        return new TeacherAdaptiveDashboardDto(totalStudents, activePaths, avg,
                openAlerts, recentRecs, latestAlerts, latestRecs);
    }

    @Transactional(readOnly = true)
    public List<LearnerPickerEntry> listAllLearners() {
        return profileRepo.findAll().stream()
                .map(p -> new LearnerPickerEntry(p.getStudentId(), "Student " + p.getStudentId(), ""))
                .collect(Collectors.toList());
    }

    @Transactional
    public void resolveAlert(Long alertId) {
        LearningDifficultyAlert alert = alertRepo.findById(alertId)
                .orElseThrow(() -> new NotFoundException("Alert not found: " + alertId));
        alert.setResolved(true);
        alertRepo.save(alert);
    }

    // ============================================================
    // RECOMMENDATIONS
    // ============================================================

    @Transactional(readOnly = true)
    public List<RecommendationView> getRecommendations(Long studentId) {
        return recRepo.findByStudentIdAndActiveTrueOrderByCreatedAtDesc(studentId)
                .stream().map(this::toRecommendationView).collect(Collectors.toList());
    }

    // ============================================================
    // HELPERS
    // ============================================================

    private CourseLevel determineLevelFromScore(int score) {
        if (score >= 90) return CourseLevel.C2;
        if (score >= 80) return CourseLevel.C1;
        if (score >= 65) return CourseLevel.B2;
        if (score >= 50) return CourseLevel.B1;
        if (score >= 30) return CourseLevel.A2;
        return CourseLevel.A1;
    }

    private CourseLevel nextLevel(CourseLevel level) {
        CourseLevel[] levels = CourseLevel.values();
        int idx = level.ordinal();
        return idx < levels.length - 1 ? levels[idx + 1] : level;
    }

    private void awardPoints(Long studentId, int points, String reason) {
        StudentGamification g = gamificationRepo.findByStudentId(studentId)
                .orElseGet(() -> {
                    StudentGamification ng = new StudentGamification();
                    ng.setStudentId(studentId);
                    ng.setPoints(0);
                    ng.setBadges("");
                    return ng;
                });
        g.setPoints(g.getPoints() + points);
        gamificationRepo.save(g);
        log.debug("Awarded {} points to student {} for: {}", points, studentId, reason);
    }

    private void updateProgressAfterCompletion(Long studentId, Long pathId) {
        List<LearningPathItem> items = pathItemRepo.findByLearningPath_IdOrderByRecommendedOrderAsc(pathId);
        int total = items.size();
        long completed = items.stream()
                .filter(i -> i.getStatus() == LearningPathItemStatus.DONE).count();
        double pct = total > 0 ? (completed * 100.0 / total) : 0;

        StudentProgress progress = progressRepo.findByLearningPathId(pathId).stream().findFirst()
                .orElseGet(() -> {
                    StudentProgress p = new StudentProgress();
                    p.setStudentId(studentId);
                    p.setLearningPathId(pathId);
                    StudentLearningProfile profile = profileRepo.findByStudentId(studentId).orElse(null);
                    p.setCurrentLevel(profile != null ? profile.getCurrentLevel() : CourseLevel.A1);
                    return p;
                });
        progress.setTotalItems(total);
        progress.setCompletedItems((int) completed);
        progress.setCompletionPercentage(pct);
        progressRepo.save(progress);
    }

    // ============================================================
    // VIEW MAPPERS
    // ============================================================

    private LearningPathView toLearningPathView(LearningPath path) {
        List<LearningPathItemView> itemViews = path.getItems().stream()
                .map(this::toLearningPathItemView)
                .collect(Collectors.toList());
        return new LearningPathView(path.getId(), path.getTitle(), path.getGoal(),
                path.getTargetLevel(), path.getStatus(), path.getCreatedAt(), itemViews);
    }

    private LearningPathItemView toLearningPathItemView(LearningPathItem item) {
        String title = "Item #" + item.getItemId();
        try {
            if (item.getItemType() == LearningPathItemType.COURSE && item.getSourceCourseId() != null) {
                CourseExternalDto course = coursesClient.getCourseById(item.getSourceCourseId());
                title = course.getTitle();
            }
        } catch (Exception e) {
            log.debug("Could not resolve item title: {}", e.getMessage());
        }
        return new LearningPathItemView(item.getId(), item.getItemId(), item.getItemType(),
                item.getRecommendedOrder(), item.getStatus(), title);
    }

    private AlertView toAlertView(LearningDifficultyAlert alert) {
        return new AlertView(alert.getId(), alert.getStudentId(),
                "Student " + alert.getStudentId(),
                alert.getReason(), alert.getSeverity(), alert.getCreatedAt());
    }

    private RecommendationView toRecommendationView(PedagogicalRecommendation rec) {
        return new RecommendationView(rec.getId(), rec.getItemTitle(), rec.getPersonalizedText(),
                rec.getItemType(), rec.getRefItemId(), rec.getSource(), rec.getCreatedAt());
    }
}
