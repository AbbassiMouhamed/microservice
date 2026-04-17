package com.smartlingua.messaging.repository;

import com.smartlingua.messaging.entity.Invitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface InvitationRepository extends JpaRepository<Invitation, Long> {
    List<Invitation> findByReceiverIdOrderByCreatedAtDesc(Long receiverId);
    List<Invitation> findBySenderIdOrderByCreatedAtDesc(Long senderId);
    List<Invitation> findByReceiverIdAndStatusOrderByCreatedAtDesc(Long receiverId, String status);

    @Query("SELECT COUNT(i) FROM Invitation i WHERE i.receiverId = :userId AND i.status = 'PENDING'")
    Long countPendingInvitations(@Param("userId") Long userId);

    @Query("SELECT i FROM Invitation i WHERE i.senderId = :senderId AND i.receiverId = :receiverId AND i.status = 'PENDING' ORDER BY i.createdAt DESC")
    List<Invitation> findPendingBySenderAndReceiver(@Param("senderId") Long senderId, @Param("receiverId") Long receiverId);
}
