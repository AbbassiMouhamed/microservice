package com.smartlingua.course.controller;

import com.smartlingua.course.dto.ResourceDto;
import com.smartlingua.course.service.ResourceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses/{courseId}/resources")
@Tag(name = "Resources", description = "Manage learning resources within a course")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping
    @Operation(summary = "List resources for a course")
    public List<ResourceDto> list(@PathVariable Long courseId) {
        return resourceService.findByCourse(courseId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a resource")
    public ResourceDto create(@PathVariable Long courseId, @Valid @RequestBody ResourceDto dto) {
        return resourceService.create(courseId, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a resource")
    public void delete(@PathVariable Long id) {
        resourceService.delete(id);
    }
}
