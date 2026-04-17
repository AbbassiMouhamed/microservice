package com.smartlingua.quiz.controller;

import com.smartlingua.quiz.dto.QuestionDto;
import com.smartlingua.quiz.service.QuestionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quiz/questions")
@Tag(name = "Questions", description = "Quiz question CRUD operations")
public class QuestionController {

    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @GetMapping
    @Operation(summary = "List questions, optionally filtered by level and skill type")
    public List<QuestionDto> list(
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String skillType) {
        return questionService.findAll(level, skillType);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a question")
    public QuestionDto create(@Valid @RequestBody QuestionDto dto) {
        return questionService.create(dto);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a question")
    public QuestionDto update(@PathVariable Long id, @Valid @RequestBody QuestionDto dto) {
        return questionService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a question")
    public void delete(@PathVariable Long id) {
        questionService.delete(id);
    }
}
