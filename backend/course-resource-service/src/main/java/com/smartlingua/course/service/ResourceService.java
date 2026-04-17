package com.smartlingua.course.service;

import com.smartlingua.course.domain.*;
import com.smartlingua.course.dto.ResourceDto;
import com.smartlingua.course.repository.CourseRepository;
import com.smartlingua.course.repository.ResourceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ResourceService {

    private final ResourceRepository resourceRepo;
    private final CourseRepository courseRepo;

    public ResourceService(ResourceRepository resourceRepo, CourseRepository courseRepo) {
        this.resourceRepo = resourceRepo;
        this.courseRepo = courseRepo;
    }

    @Transactional(readOnly = true)
    public List<ResourceDto> findByCourse(Long courseId) {
        return resourceRepo.findByCourseId(courseId).stream().map(this::toDto).toList();
    }

    public ResourceDto create(Long courseId, ResourceDto dto) {
        Course course = courseRepo.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found: " + courseId));
        Resource r = new Resource();
        r.setTitle(dto.title());
        r.setType(dto.type());
        r.setUrl(dto.url());
        r.setCourse(course);
        return toDto(resourceRepo.save(r));
    }

    public void delete(Long id) {
        resourceRepo.deleteById(id);
    }

    private ResourceDto toDto(Resource r) {
        return new ResourceDto(r.getId(), r.getTitle(), r.getType(), r.getUrl());
    }
}
