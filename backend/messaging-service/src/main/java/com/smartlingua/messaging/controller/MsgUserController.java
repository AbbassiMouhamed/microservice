package com.smartlingua.messaging.controller;

import com.smartlingua.messaging.entity.MsgUser;
import com.smartlingua.messaging.repository.MsgUserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messaging/users")
public class MsgUserController {

    private final MsgUserRepository userRepository;

    public MsgUserController(MsgUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<Map<String, Object>> users = userRepository.findAll().stream()
                .map(u -> Map.<String, Object>of(
                        "id", u.getId(),
                        "username", u.getUsername(),
                        "role", u.getRole()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }
}
