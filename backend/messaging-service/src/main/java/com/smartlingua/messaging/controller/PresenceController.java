package com.smartlingua.messaging.controller;

import com.smartlingua.messaging.service.PresenceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messaging/presence")
public class PresenceController {

    private final PresenceService presenceService;

    public PresenceController(PresenceService presenceService) {
        this.presenceService = presenceService;
    }

    @GetMapping("/online")
    public ResponseEntity<List<Long>> getOnlineUserIds() {
        return ResponseEntity.ok(presenceService.getOnlineUserIds());
    }

    @PostMapping("/heartbeat")
    public ResponseEntity<?> heartbeat(@RequestBody Map<String, Long> body) {
        Long userId = body != null ? body.get("userId") : null;
        presenceService.heartbeat(userId);
        return ResponseEntity.ok().build();
    }
}
