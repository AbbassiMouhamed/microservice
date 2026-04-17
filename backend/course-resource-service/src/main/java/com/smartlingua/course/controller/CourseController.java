package com.smartlingua.course.controller;

import com.smartlingua.course.domain.CourseLevel;
import com.smartlingua.course.dto.CourseDto;
import com.smartlingua.course.dto.CourseSummaryDto;
import com.smartlingua.course.service.CourseService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping
    public Page<CourseDto> list(@RequestParam(required = false) CourseLevel level, Pageable pageable) {
        return level != null ? courseService.findByLevel(level, pageable) : courseService.findAll(pageable);
    }

    @GetMapping("/{id}")
    public CourseDto get(@PathVariable Long id) {
        return courseService.findById(id);
    }

    @GetMapping("/{id}/summary")
    public CourseSummaryDto summary(@PathVariable Long id) {
        return courseService.summary(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CourseDto create(@Valid @RequestBody CourseDto dto) {
        return courseService.create(dto);
    }

    @PutMapping("/{id}")
    public CourseDto update(@PathVariable Long id, @Valid @RequestBody CourseDto dto) {
        return courseService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        courseService.delete(id);
    }
}
