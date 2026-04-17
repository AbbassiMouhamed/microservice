package com.smartlingua.course.service;

import com.smartlingua.course.domain.*;
import com.smartlingua.course.repository.CourseRepository;
import com.smartlingua.course.repository.SeanceRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class SchedulerService {

    private final CourseRepository courseRepo;
    private final SeanceRepository seanceRepo;

    public SchedulerService(CourseRepository courseRepo, SeanceRepository seanceRepo) {
        this.courseRepo = courseRepo;
        this.seanceRepo = seanceRepo;
    }

    /** Auto-transition course status based on dates. */
    @Scheduled(fixedRate = 60_000)
    @Transactional
    public void updateCourseStatuses() {
        LocalDate today = LocalDate.now();
        for (Course c : courseRepo.findAll()) {
            if (c.getStartDate() != null && !today.isBefore(c.getStartDate()) && c.getStatus() == CourseStatus.PLANNED) {
                c.setStatus(CourseStatus.ACTIVE);
                courseRepo.save(c);
            }
            if (c.getEndDate() != null && today.isAfter(c.getEndDate()) && c.getStatus() == CourseStatus.ACTIVE) {
                c.setStatus(CourseStatus.FINISHED);
                courseRepo.save(c);
            }
        }
    }

    /** Auto-transition seance status based on time. */
    @Scheduled(fixedRate = 60_000)
    @Transactional
    public void updateSeanceStatuses() {
        LocalDateTime now = LocalDateTime.now();
        for (Seance s : seanceRepo.findAll()) {
            if (s.getStatus() == SeanceStatus.PLANNED && !now.isBefore(s.getStartDateTime())) {
                s.setStatus(SeanceStatus.ONGOING);
                seanceRepo.save(s);
            }
            if (s.getStatus() == SeanceStatus.ONGOING &&
                    now.isAfter(s.getStartDateTime().plusMinutes(s.getDurationMinutes()))) {
                s.setStatus(SeanceStatus.DONE);
                seanceRepo.save(s);
            }
        }
    }
}
