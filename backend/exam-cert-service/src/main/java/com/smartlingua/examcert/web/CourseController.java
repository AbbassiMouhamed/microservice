package com.smartlingua.examcert.web;

import com.smartlingua.examcert.domain.CourseEntity;
import com.smartlingua.examcert.service.CourseService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping
    public List<CourseResponse> list() {
        return courseService.list().stream().map(CourseResponse::from).toList();
    }

    @GetMapping("/{id}")
    public CourseResponse get(@PathVariable("id") UUID id) {
        return CourseResponse.from(courseService.get(id));
    }

    @PostMapping
    public CourseResponse create(@RequestBody @Valid CreateCourseRequest req) {
        CourseEntity course = courseService.create(new CourseService.CreateCourseCommand(req.title(), req.level(), req.startDate()));
        return CourseResponse.from(course);
    }

    public record CreateCourseRequest(@NotBlank String title, String level, OffsetDateTime startDate) {
    }

    public record CourseResponse(UUID id, String title, String level, OffsetDateTime startDate) {
        static CourseResponse from(CourseEntity e) {
            return new CourseResponse(e.getId(), e.getTitle(), e.getLevel(), e.getStartDate());
        }
    }
}
