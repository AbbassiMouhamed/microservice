package com.smartlingua.messaging.repository;

import com.smartlingua.messaging.entity.BadWord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BadWordRepository extends JpaRepository<BadWord, Long> {
    List<BadWord> findAllByOrderByWordAsc();
}
