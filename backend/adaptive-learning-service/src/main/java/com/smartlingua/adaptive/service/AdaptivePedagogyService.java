package com.smartlingua.adaptive.service;

import com.smartlingua.adaptive.dto.external.CourseExternalDto;
import com.smartlingua.adaptive.entity.*;
import com.smartlingua.adaptive.entity.enums.*;
import com.smartlingua.adaptive.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdaptivePedagogyService {
    private static final Logger log = LoggerFactory.getLogger(AdaptivePedagogyService.class);

    private final PedagogicalRecommendationRepository recRepo;
    private final AIRecommendationService aiService;

    public AdaptivePedagogyService(PedagogicalRecommendationRepository recRepo,
                                   AIRecommendationService aiService) {
        this.recRepo = recRepo;
        this.aiService = aiService;
    }

    @Transactional
    public void buildRecommendationsAfterLevel(Long studentId, CourseLevel level,
                                               List<CourseExternalDto> courses) {
        for (CourseExternalDto course : courses) {
            if (course.getLevel() != level) continue;
            if (recRepo.existsByStudentIdAndItemTypeAndRefItemIdAndCreatedAtAfter(
                    studentId, LearningPathItemType.COURSE, course.getId(),
                    java.time.Instant.now().minusSeconds(3600))) {
                continue;
            }
            String text = aiService.getRecommendation(
                    "You are a language pedagogy assistant.",
                    "Recommend course '" + course.getTitle() + "' at " + level + " level for student.");
            PedagogicalRecommendation rec = new PedagogicalRecommendation();
            rec.setStudentId(studentId);
            rec.setItemType(LearningPathItemType.COURSE);
            rec.setRefItemId(course.getId());
            rec.setItemTitle(course.getTitle());
            rec.setPersonalizedText(text);
            rec.setSource(RecommendationSource.RULE);
            rec.setActive(true);
            recRepo.save(rec);
        }
    }

    @Transactional
    public void generateRecommendationsForStrugglingStudent(Long studentId,
                                                           CourseLevel level,
                                                           List<CourseExternalDto> courses) {
        for (CourseExternalDto course : courses) {
            if (course.getLevel() != level) continue;
            if (recRepo.existsByStudentIdAndItemTypeAndRefItemIdAndCreatedAtAfter(
                    studentId, LearningPathItemType.RESOURCE, course.getId(),
                    java.time.Instant.now().minusSeconds(7200))) {
                continue;
            }
            String text = aiService.getRecommendation(
                    "You are a supportive language tutor helping a struggling student.",
                    "Student at " + level + " struggling with course '" + course.getTitle() + "'. Suggest support.");
            PedagogicalRecommendation rec = new PedagogicalRecommendation();
            rec.setStudentId(studentId);
            rec.setItemType(LearningPathItemType.RESOURCE);
            rec.setRefItemId(course.getId());
            rec.setItemTitle("Support: " + course.getTitle());
            rec.setPersonalizedText(text);
            rec.setSource(RecommendationSource.AI);
            rec.setActive(true);
            recRepo.save(rec);
        }
    }
}
