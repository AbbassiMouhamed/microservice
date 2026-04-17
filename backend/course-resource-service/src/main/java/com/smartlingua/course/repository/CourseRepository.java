package com.smartlingua.course.repository;

import com.smartlingua.course.domain.Course;
import com.smartlingua.course.domain.CourseLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course, Long> {
    Page<Course> findAll(Pageable pageable);
    Page<Course> findByLevel(CourseLevel level, Pageable pageable);
}
