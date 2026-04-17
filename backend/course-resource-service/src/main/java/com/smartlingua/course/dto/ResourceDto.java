package com.smartlingua.course.dto;

import com.smartlingua.course.domain.ResourceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ResourceDto(
        Long id,
        @NotBlank String title,
        @NotNull ResourceType type,
        String url
) {}
