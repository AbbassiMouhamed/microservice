package com.smartlingua.course.controller;

import com.smartlingua.course.dto.ChapterDto;
import com.smartlingua.course.service.ChapterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses/{courseId}/chapters")
@Tag(name = "Chapters", description = "Manage chapters within a course")
public class ChapterController {

    private final ChapterService chapterService;

    public ChapterController(ChapterService chapterService) {
        this.chapterService = chapterService;
    }

    @GetMapping
    @Operation(summary = "List chapters for a course")
    public List<ChapterDto> list(@PathVariable Long courseId) {
        return chapterService.findByCourse(courseId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a chapter")
    public ChapterDto create(@PathVariable Long courseId, @Valid @RequestBody ChapterDto dto) {
        return chapterService.create(courseId, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a chapter")
    public void delete(@PathVariable Long id) {
        chapterService.delete(id);
    }
}
