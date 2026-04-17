package com.smartlingua.adaptive.feign;

import com.smartlingua.adaptive.dto.external.*;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@FeignClient(name = "course-resource-service", configuration = {FeignBearerTokenConfig.class, FeignClientJacksonConfig.class})
public interface CoursesClient {
    @GetMapping("/api/courses")
    List<CourseExternalDto> getAllCourses(@RequestParam(value = "level", required = false) String level);

    @GetMapping("/api/courses/{courseId}")
    CourseExternalDto getCourseById(@PathVariable("courseId") Long courseId);

    @GetMapping("/api/courses/{courseId}/resources")
    List<ResourceExternalDto> getResourcesByCourse(@PathVariable("courseId") Long courseId);

    @GetMapping("/api/courses/{courseId}/seances")
    List<SeanceExternalDto> getSeancesByCourse(@PathVariable("courseId") Long courseId);

    @GetMapping("/api/courses/{courseId}/chapters")
    List<ChapterExternalDto> getChaptersByCourse(@PathVariable("courseId") Long courseId);
}
