package com.smartlingua.course.repository;

import com.smartlingua.course.domain.Resource;
import com.smartlingua.course.domain.ResourceType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findByCourseId(Long courseId);
    long countByType(ResourceType type);
}
