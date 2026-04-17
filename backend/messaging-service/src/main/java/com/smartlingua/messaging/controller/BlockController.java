package com.smartlingua.messaging.controller;

import com.smartlingua.messaging.service.BlockService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messaging/block")
public class BlockController {

    @Autowired private BlockService blockService;

    @PostMapping("/{blockerId}/{blockedId}")
    public ResponseEntity<?> block(@PathVariable Long blockerId, @PathVariable Long blockedId) {
        try {
            blockService.block(blockerId, blockedId);
            return ResponseEntity.ok(Map.of("status", "blocked"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{blockerId}/{blockedId}")
    public ResponseEntity<?> unblock(@PathVariable Long blockerId, @PathVariable Long blockedId) {
        blockService.unblock(blockerId, blockedId);
        return ResponseEntity.ok(Map.of("status", "unblocked"));
    }

    @GetMapping("/{blockerId}")
    public ResponseEntity<List<Long>> getBlockedUsers(@PathVariable Long blockerId) {
        return ResponseEntity.ok(blockService.getBlockedUserIds(blockerId));
    }
}
