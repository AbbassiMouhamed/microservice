package com.smartlingua.adaptive.service;

import com.smartlingua.adaptive.entity.enums.CourseLevel;
import org.springframework.stereotype.Service;

@Service
public class CourseLevelAccessPolicy {
    public boolean canAccessCourse(CourseLevel studentLevel, CourseLevel courseLevel) {
        if (studentLevel == null || courseLevel == null) return false;
        return courseLevel.ordinal() <= studentLevel.ordinal();
    }
}
