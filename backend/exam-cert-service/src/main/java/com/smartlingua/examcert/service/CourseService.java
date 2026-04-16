package com.smartlingua.examcert.service;

import com.smartlingua.examcert.domain.CourseEntity;
import com.smartlingua.examcert.repo.CourseRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class CourseService {

    private final CourseRepository courseRepository;

    public CourseService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    public List<CourseEntity> list() {
        return courseRepository.findAll();
    }

    public CourseEntity get(UUID courseId) {
        return courseRepository.findById(courseId).orElseThrow(() -> new NotFoundException("Course not found"));
    }

    @Transactional
    public CourseEntity create(CreateCourseCommand cmd) {
        CourseEntity course = CourseEntity.builder()
                .id(UUID.randomUUID())
                .title(cmd.title())
                .level(cmd.level())
                .startDate(cmd.startDate())
                .build();
        return courseRepository.save(course);
    }

    @Transactional
    public void delete(UUID courseId) {
        CourseEntity course = get(courseId);
        try {
            courseRepository.delete(course);
            courseRepository.flush();
        } catch (DataIntegrityViolationException e) {
            throw new BadRequestException("Cannot delete course: it is referenced by other data");
        }
    }

    public record CreateCourseCommand(String title, String level, OffsetDateTime startDate) {
    }
}
