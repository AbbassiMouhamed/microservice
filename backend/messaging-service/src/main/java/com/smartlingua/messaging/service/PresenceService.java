package com.smartlingua.messaging.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class PresenceService {

    private static final long TIMEOUT_MS = 30_000;
    private final Map<Long, Instant> heartbeats = new ConcurrentHashMap<>();

    public void heartbeat(Long userId) {
        if (userId != null) heartbeats.put(userId, Instant.now());
    }

    public List<Long> getOnlineUserIds() {
        Instant cutoff = Instant.now().minusMillis(TIMEOUT_MS);
        return heartbeats.entrySet().stream()
                .filter(e -> e.getValue().isAfter(cutoff))
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    @Scheduled(fixedRate = 60_000)
    public void cleanupStale() {
        Instant cutoff = Instant.now().minusMillis(TIMEOUT_MS * 2);
        heartbeats.entrySet().removeIf(e -> e.getValue().isBefore(cutoff));
    }
}
