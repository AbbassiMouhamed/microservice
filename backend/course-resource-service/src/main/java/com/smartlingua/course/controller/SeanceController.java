package com.smartlingua.course.controller;

import com.smartlingua.course.dto.SeanceDto;
import com.smartlingua.course.service.SeanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses/{courseId}/seances")
@Tag(name = "Seances", description = "Manage seances (sessions) within a course")
public class SeanceController {

    private final SeanceService seanceService;

    public SeanceController(SeanceService seanceService) {
        this.seanceService = seanceService;
    }

    @GetMapping
    @Operation(summary = "List seances for a course")
    public List<SeanceDto> list(@PathVariable Long courseId) {
        return seanceService.findByCourse(courseId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a seance")
    public SeanceDto create(@PathVariable Long courseId, @Valid @RequestBody SeanceDto dto) {
        return seanceService.create(courseId, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a seance")
    public void delete(@PathVariable Long id) {
        seanceService.delete(id);
    }
}
