package com.smartlingua.forum.controller;

import com.smartlingua.forum.dto.*;
import com.smartlingua.forum.service.AnnouncementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/forum/announcements")
@Tag(name = "Announcements", description = "Manage forum announcements")
public class AnnouncementController {

    private final AnnouncementService announcementService;

    public AnnouncementController(AnnouncementService announcementService) {
        this.announcementService = announcementService;
    }

    @PostMapping
    @Operation(summary = "Create a new announcement")
    public ResponseEntity<AnnouncementResponse> create(@Valid @RequestBody AnnouncementRequest req,
                                                        @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.status(HttpStatus.CREATED).body(announcementService.create(req, jwt));
    }

    @GetMapping
    @Operation(summary = "Get active announcements")
    public List<AnnouncementResponse> getActive() {
        return announcementService.getActive();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get announcement by ID")
    public AnnouncementResponse getById(@PathVariable Long id) {
        return announcementService.getById(id);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an announcement")
    public AnnouncementResponse update(@PathVariable Long id,
                                        @Valid @RequestBody AnnouncementRequest req,
                                        @AuthenticationPrincipal Jwt jwt) {
        return announcementService.update(id, req, jwt);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete an announcement")
    public void delete(@PathVariable Long id) {
        announcementService.delete(id);
    }
}
