package com.smartlingua.forum.service;

import com.smartlingua.forum.domain.*;
import com.smartlingua.forum.dto.*;
import com.smartlingua.forum.repository.*;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class AnnouncementService {

    private final AnnouncementRepository announcementRepo;
    private final NotificationService notificationService;
    private final JwtHelper jwtHelper;

    public AnnouncementService(AnnouncementRepository announcementRepo,
                               NotificationService notificationService, JwtHelper jwtHelper) {
        this.announcementRepo = announcementRepo;
        this.notificationService = notificationService;
        this.jwtHelper = jwtHelper;
    }

    public AnnouncementResponse create(AnnouncementRequest req, Jwt jwt) {
        Announcement a = new Announcement();
        a.setTitle(req.title());
        a.setContent(req.content());
        a.setAuthorId(jwtHelper.getUserId(jwt));
        a.setAuthorName(jwtHelper.getUserName(jwt));
        a = announcementRepo.save(a);
        return toResponse(a);
    }

    @Transactional(readOnly = true)
    public List<AnnouncementResponse> getActive() {
        return announcementRepo.findByActiveTrueOrderByPublishedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AnnouncementResponse getById(Long id) {
        return toResponse(announcementRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Announcement not found: " + id)));
    }

    public AnnouncementResponse update(Long id, AnnouncementRequest req, Jwt jwt) {
        Announcement a = announcementRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Announcement not found: " + id));
        a.setTitle(req.title());
        a.setContent(req.content());
        a = announcementRepo.save(a);
        return toResponse(a);
    }

    public void delete(Long id) {
        announcementRepo.deleteById(id);
    }

    private AnnouncementResponse toResponse(Announcement a) {
        return new AnnouncementResponse(
                a.getId(), a.getTitle(), a.getContent(),
                a.getAuthorId(), a.getAuthorName(),
                a.getPublishedAt(), a.isActive(),
                a.getCreatedAt(), a.getUpdatedAt()
        );
    }
}
