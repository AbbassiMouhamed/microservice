package com.smartlingua.course.dto;

import com.smartlingua.course.domain.ChapterContentKind;
import jakarta.validation.constraints.NotNull;

public record ChapterContentDto(
        Long id,
        @NotNull ChapterContentKind type,
        String title,
        String url,
        boolean required
) {}
