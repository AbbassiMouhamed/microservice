package com.smartlingua.messaging.repository;

import com.smartlingua.messaging.entity.MsgUser;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MsgUserRepository extends JpaRepository<MsgUser, Long> {
    Optional<MsgUser> findByEmailIgnoreCase(String email);
    Optional<MsgUser> findByKeycloakSub(String keycloakSub);
    boolean existsByEmailIgnoreCase(String email);
    List<MsgUser> findByRoleIgnoreCase(String role);
}
