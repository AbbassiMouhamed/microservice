package com.smartlingua.course.repository;

import com.smartlingua.course.domain.Seance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface SeanceRepository extends JpaRepository<Seance, Long> {
    List<Seance> findByCourseId(Long courseId);

    @Query("SELECT s FROM Seance s WHERE s.status = 'PLANNED' ORDER BY s.startDateTime ASC")
    List<Seance> findUpcoming();
}
