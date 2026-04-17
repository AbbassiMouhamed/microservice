package com.smartlingua.forum.controller;

import com.smartlingua.forum.dto.*;
import com.smartlingua.forum.service.AnnouncementService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/forum/announcements")
public class AnnouncementController {

    private final AnnouncementService announcementService;

    public AnnouncementController(AnnouncementService announcementService) {
        this.announcementService = announcementService;
    }

    @PostMapping
    public ResponseEntity<AnnouncementResponse> create(@Valid @RequestBody AnnouncementRequest req,
                                                        @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.status(HttpStatus.CREATED).body(announcementService.create(req, jwt));
    }

    @GetMapping
    public List<AnnouncementResponse> getActive() {
        return announcementService.getActive();
    }

    @GetMapping("/{id}")
    public AnnouncementResponse getById(@PathVariable Long id) {
        return announcementService.getById(id);
    }

    @PutMapping("/{id}")
    public AnnouncementResponse update(@PathVariable Long id,
                                        @Valid @RequestBody AnnouncementRequest req,
                                        @AuthenticationPrincipal Jwt jwt) {
        return announcementService.update(id, req, jwt);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        announcementService.delete(id);
    }
}
