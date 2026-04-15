package com.smartlingua.examcert.repo;

import com.smartlingua.examcert.domain.UserEntity;
import com.smartlingua.examcert.domain.UserType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<UserEntity, UUID> {

    Optional<UserEntity> findByEmail(String email);

    List<UserEntity> findByUserType(UserType userType);
}
