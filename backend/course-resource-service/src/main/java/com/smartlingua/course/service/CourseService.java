package com.smartlingua.course.service;

import com.smartlingua.course.domain.*;
import com.smartlingua.course.dto.*;
import com.smartlingua.course.repository.CourseRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CourseService {

    private final CourseRepository courseRepo;

    public CourseService(CourseRepository courseRepo) {
        this.courseRepo = courseRepo;
    }

    @Transactional(readOnly = true)
    public Page<CourseDto> findAll(Pageable pageable) {
        return courseRepo.findAll(pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<CourseDto> findByLevel(CourseLevel level, Pageable pageable) {
        return courseRepo.findByLevel(level, pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public CourseDto findById(Long id) {
        return toDto(getOrThrow(id));
    }

    public CourseDto create(CourseDto dto) {
        Course c = new Course();
        applyDto(c, dto);
        return toDto(courseRepo.save(c));
    }

    public CourseDto update(Long id, CourseDto dto) {
        Course c = getOrThrow(id);
        applyDto(c, dto);
        return toDto(courseRepo.save(c));
    }

    public void delete(Long id) {
        courseRepo.delete(getOrThrow(id));
    }

    @Transactional(readOnly = true)
    public CourseSummaryDto summary(Long id) {
        Course c = getOrThrow(id);
        return new CourseSummaryDto(c.getId(), c.getTitle(), c.getLevel(), c.getStatus(),
                c.getChapters().size(), c.getResources().size(), c.getSeances().size());
    }

    private Course getOrThrow(Long id) {
        return courseRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Course not found: " + id));
    }

    private void applyDto(Course c, CourseDto dto) {
        c.setTitle(dto.title());
        c.setDescription(dto.description());
        c.setLevel(dto.level());
        c.setStartDate(dto.startDate());
        c.setEndDate(dto.endDate());
        if (dto.status() != null) c.setStatus(dto.status());
        if (dto.price() != null) c.setPrice(dto.price());
    }

    private CourseDto toDto(Course c) {
        return new CourseDto(c.getId(), c.getTitle(), c.getDescription(), c.getLevel(),
                c.getStartDate(), c.getEndDate(), c.getStatus(), c.getPrice());
    }
}
