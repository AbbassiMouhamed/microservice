package com.smartlingua.examcert.web;

import com.smartlingua.examcert.domain.CourseEntity;
import com.smartlingua.examcert.service.CourseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/exams/courses")
@Tag(name = "Courses (Exam)", description = "Course management for exam & certification context")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping
    @Operation(summary = "List all courses")
    public List<CourseResponse> list() {
        return courseService.list().stream().map(CourseResponse::from).toList();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get course by ID")
    public CourseResponse get(@PathVariable("id") UUID id) {
        return CourseResponse.from(courseService.get(id));
    }

    @PostMapping
    @Operation(summary = "Create a new course")
    public CourseResponse create(@RequestBody @Valid CreateCourseRequest req) {
        CourseEntity course = courseService.create(new CourseService.CreateCourseCommand(req.title(), req.level(), req.startDate()));
        return CourseResponse.from(course);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a course")
    public void delete(@PathVariable("id") UUID id) {
        courseService.delete(id);
    }

    public record CreateCourseRequest(@NotBlank String title, String level, OffsetDateTime startDate) {
    }

    public record CourseResponse(UUID id, String title, String level, OffsetDateTime startDate) {
        static CourseResponse from(CourseEntity e) {
            return new CourseResponse(e.getId(), e.getTitle(), e.getLevel(), e.getStartDate());
        }
    }
}
