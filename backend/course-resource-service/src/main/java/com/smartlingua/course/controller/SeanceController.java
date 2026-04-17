package com.smartlingua.course.controller;

import com.smartlingua.course.dto.SeanceDto;
import com.smartlingua.course.service.SeanceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses/{courseId}/seances")
public class SeanceController {

    private final SeanceService seanceService;

    public SeanceController(SeanceService seanceService) {
        this.seanceService = seanceService;
    }

    @GetMapping
    public List<SeanceDto> list(@PathVariable Long courseId) {
        return seanceService.findByCourse(courseId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SeanceDto create(@PathVariable Long courseId, @Valid @RequestBody SeanceDto dto) {
        return seanceService.create(courseId, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        seanceService.delete(id);
    }
}
