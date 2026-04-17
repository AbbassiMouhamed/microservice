package com.smartlingua.course.repository;

import com.smartlingua.course.domain.Chapter;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChapterRepository extends JpaRepository<Chapter, Long> {
    List<Chapter> findByCourseIdOrderByOrderIndex(Long courseId);
}
