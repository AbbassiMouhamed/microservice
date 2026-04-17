package com.smartlingua.messaging.repository;

import com.smartlingua.messaging.entity.UserBan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.Optional;

public interface UserBanRepository extends JpaRepository<UserBan, Long> {
    Optional<UserBan> findByUserId(Long userId);

    @Query("SELECT ub FROM UserBan ub WHERE ub.userId = :userId AND ub.bannedUntil > :now")
    Optional<UserBan> findActiveBan(@Param("userId") Long userId, @Param("now") LocalDateTime now);
}
