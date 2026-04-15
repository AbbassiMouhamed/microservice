package com.smartlingua.examcert.service;

import com.smartlingua.examcert.domain.UserEntity;
import com.smartlingua.examcert.domain.UserType;
import com.smartlingua.examcert.repo.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserEntity> list(UserType type) {
        return type == null ? userRepository.findAll() : userRepository.findByUserType(type);
    }

    public UserEntity get(UUID id) {
        return userRepository.findById(id).orElseThrow(() -> new NotFoundException("User not found"));
    }

    @Transactional
    public UserEntity create(CreateUserCommand cmd) {
        if (userRepository.findByEmail(cmd.email()).isPresent()) {
            throw new BadRequestException("Email already exists");
        }
        UserEntity user = UserEntity.builder()
                .id(UUID.randomUUID())
                .name(cmd.name())
                .email(cmd.email())
                .userType(cmd.userType())
                .build();
        return userRepository.save(user);
    }

    public record CreateUserCommand(String name, String email, UserType userType) {
    }
}
