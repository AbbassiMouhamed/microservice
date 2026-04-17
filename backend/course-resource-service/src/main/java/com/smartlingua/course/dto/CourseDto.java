package com.smartlingua.course.dto;

import com.smartlingua.course.domain.CourseLevel;
import com.smartlingua.course.domain.CourseStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record CourseDto(
        Long id,
        @NotBlank String title,
        String description,
        @NotNull CourseLevel level,
        LocalDate startDate,
        LocalDate endDate,
        CourseStatus status,
        Double price
) {}
