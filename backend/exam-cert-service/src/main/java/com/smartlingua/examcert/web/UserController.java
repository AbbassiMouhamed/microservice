package com.smartlingua.examcert.web;

import com.smartlingua.examcert.domain.UserEntity;
import com.smartlingua.examcert.domain.UserType;
import com.smartlingua.examcert.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<UserResponse> list(@RequestParam(name = "type", required = false) UserType type) {
        return userService.list(type).stream().map(UserResponse::from).toList();
    }

    @GetMapping("/{id}")
    public UserResponse get(@PathVariable("id") UUID id) {
        return UserResponse.from(userService.get(id));
    }

    @PostMapping
    public UserResponse create(@RequestBody @Valid CreateUserRequest req) {
        UserEntity user = userService.create(new UserService.CreateUserCommand(req.name(), req.email(), req.userType()));
        return UserResponse.from(user);
    }

    public record CreateUserRequest(
            @NotBlank String name,
            @NotBlank @Email String email,
            @NotNull UserType userType
    ) {
    }

    public record UserResponse(UUID id, String name, String email, UserType userType) {
        static UserResponse from(UserEntity e) {
            return new UserResponse(e.getId(), e.getName(), e.getEmail(), e.getUserType());
        }
    }
}
