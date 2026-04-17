package com.smartlingua.forum.controller;

import com.smartlingua.forum.dto.NotificationResponse;
import com.smartlingua.forum.service.JwtHelper;
import com.smartlingua.forum.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/forum/notifications")
@Tag(name = "Notifications", description = "User notification management")
public class NotificationController {

    private final NotificationService notificationService;
    private final JwtHelper jwtHelper;

    public NotificationController(NotificationService notificationService, JwtHelper jwtHelper) {
        this.notificationService = notificationService;
        this.jwtHelper = jwtHelper;
    }

    @GetMapping
    @Operation(summary = "Get all notifications for current user")
    public List<NotificationResponse> getAll(@AuthenticationPrincipal Jwt jwt) {
        return notificationService.getForUser(jwtHelper.getUserId(jwt));
    }

    @GetMapping("/unread")
    @Operation(summary = "Get unread notifications")
    public List<NotificationResponse> getUnread(@AuthenticationPrincipal Jwt jwt) {
        return notificationService.getUnreadForUser(jwtHelper.getUserId(jwt));
    }

    @GetMapping("/unread/count")
    @Operation(summary = "Count unread notifications")
    public Map<String, Long> countUnread(@AuthenticationPrincipal Jwt jwt) {
        return Map.of("count", notificationService.countUnread(jwtHelper.getUserId(jwt)));
    }

    @PatchMapping("/{id}/read")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Mark a notification as read")
    public void markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
    }

    @PostMapping("/read-all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Mark all notifications as read")
    public void markAllAsRead(@AuthenticationPrincipal Jwt jwt) {
        notificationService.markAllAsRead(jwtHelper.getUserId(jwt));
    }
}
