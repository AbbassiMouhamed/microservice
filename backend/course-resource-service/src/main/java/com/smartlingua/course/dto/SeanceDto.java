package com.smartlingua.course.dto;

import com.smartlingua.course.domain.SeanceStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record SeanceDto(
        Long id,
        @NotBlank String title,
        @NotNull LocalDateTime startDateTime,
        @NotNull Integer durationMinutes,
        SeanceStatus status,
        String description
) {}
