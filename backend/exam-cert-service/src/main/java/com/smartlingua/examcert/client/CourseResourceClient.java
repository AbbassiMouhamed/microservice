package com.smartlingua.examcert.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

/**
 * Feign client for course-resource-service.
 * Used to sync the course catalogue into exam-cert-service so the
 * "Create Exam" dropdown always reflects the courses that actually exist.
 */
@FeignClient(name = "course-resource-service")
public interface CourseResourceClient {

    @JsonIgnoreProperties(ignoreUnknown = true)
    record CourseDto(Long id, String title, String level) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record PageDto(List<CourseDto> content) {}

    @GetMapping("/api/courses")
    PageDto listCourses(@RequestParam("page") int page, @RequestParam("size") int size);
}
