package com.smartlingua.course.dto;

import com.smartlingua.course.domain.SkillType;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record ChapterDto(
        Long id,
        @NotBlank String title,
        String description,
        SkillType skillType,
        Integer orderIndex,
        boolean required,
        List<ChapterContentDto> contents
) {}
