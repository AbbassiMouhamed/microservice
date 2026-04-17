package com.smartlingua.course.service;

import com.smartlingua.course.domain.ResourceType;
import com.smartlingua.course.dto.StatisticsDto;
import com.smartlingua.course.repository.CourseRepository;
import com.smartlingua.course.repository.ResourceRepository;
import com.smartlingua.course.repository.SeanceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class StatisticsService {

    private final CourseRepository courseRepo;
    private final ResourceRepository resourceRepo;
    private final SeanceRepository seanceRepo;

    public StatisticsService(CourseRepository courseRepo, ResourceRepository resourceRepo, SeanceRepository seanceRepo) {
        this.courseRepo = courseRepo;
        this.resourceRepo = resourceRepo;
        this.seanceRepo = seanceRepo;
    }

    public StatisticsDto getStatistics() {
        return new StatisticsDto(
                courseRepo.count(),
                resourceRepo.count(),
                seanceRepo.count(),
                resourceRepo.countByType(ResourceType.PDF),
                resourceRepo.countByType(ResourceType.VIDEO),
                resourceRepo.countByType(ResourceType.AUDIO)
        );
    }
}
