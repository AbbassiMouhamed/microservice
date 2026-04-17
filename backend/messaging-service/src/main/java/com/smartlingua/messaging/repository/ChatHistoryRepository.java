package com.smartlingua.messaging.repository;

import com.smartlingua.messaging.entity.ChatHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatHistoryRepository extends JpaRepository<ChatHistory, Long> {
    List<ChatHistory> findTop30ByUserIdOrderByCreatedAtDesc(Long userId);
}
