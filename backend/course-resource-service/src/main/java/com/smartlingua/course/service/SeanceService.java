package com.smartlingua.course.service;

import com.smartlingua.course.domain.*;
import com.smartlingua.course.dto.SeanceDto;
import com.smartlingua.course.repository.CourseRepository;
import com.smartlingua.course.repository.SeanceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class SeanceService {

    private final SeanceRepository seanceRepo;
    private final CourseRepository courseRepo;

    public SeanceService(SeanceRepository seanceRepo, CourseRepository courseRepo) {
        this.seanceRepo = seanceRepo;
        this.courseRepo = courseRepo;
    }

    @Transactional(readOnly = true)
    public List<SeanceDto> findByCourse(Long courseId) {
        return seanceRepo.findByCourseId(courseId).stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<SeanceDto> findUpcoming() {
        return seanceRepo.findUpcoming().stream().map(this::toDto).toList();
    }

    public SeanceDto create(Long courseId, SeanceDto dto) {
        Course course = courseRepo.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found: " + courseId));
        Seance s = new Seance();
        s.setTitle(dto.title());
        s.setStartDateTime(dto.startDateTime());
        s.setDurationMinutes(dto.durationMinutes());
        if (dto.status() != null) s.setStatus(dto.status());
        s.setDescription(dto.description());
        s.setCourse(course);
        return toDto(seanceRepo.save(s));
    }

    public void delete(Long id) {
        seanceRepo.deleteById(id);
    }

    private SeanceDto toDto(Seance s) {
        return new SeanceDto(s.getId(), s.getTitle(), s.getStartDateTime(),
                s.getDurationMinutes(), s.getStatus(), s.getDescription());
    }
}
