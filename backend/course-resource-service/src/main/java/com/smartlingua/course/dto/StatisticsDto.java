package com.smartlingua.course.dto;

public record StatisticsDto(
        long totalCourses,
        long totalResources,
        long totalSeances,
        long pdfCount,
        long videoCount,
        long audioCount
) {}
