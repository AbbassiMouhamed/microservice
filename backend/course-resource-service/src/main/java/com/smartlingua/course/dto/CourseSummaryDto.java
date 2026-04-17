package com.smartlingua.course.dto;

import com.smartlingua.course.domain.CourseLevel;
import com.smartlingua.course.domain.CourseStatus;

public record CourseSummaryDto(
        Long id,
        String title,
        CourseLevel level,
        CourseStatus status,
        int chaptersCount,
        int resourcesCount,
        int seancesCount
) {}
