package com.smartlingua.examcert.service;

import com.smartlingua.examcert.client.CourseResourceClient;
import com.smartlingua.examcert.domain.CourseEntity;
import com.smartlingua.examcert.repo.CourseRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.ByteBuffer;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class CourseService {

    private static final Logger log = LoggerFactory.getLogger(CourseService.class);

    private final CourseRepository courseRepository;
    private final CourseResourceClient courseResourceClient;

    public CourseService(CourseRepository courseRepository, CourseResourceClient courseResourceClient) {
        this.courseRepository = courseRepository;
        this.courseResourceClient = courseResourceClient;
    }

    /**
     * Fetch the course list, synchronising from course-resource-service first.
     * If the upstream call fails (service unavailable / cold start), we fall back
     * to whatever is already in the local cache so the endpoint never returns an error.
     */
    @Transactional
    public List<CourseEntity> syncAndList() {
        try {
            CourseResourceClient.PageDto page = courseResourceClient.listCourses(0, 500);
            if (page != null && page.content() != null) {
                for (CourseResourceClient.CourseDto dto : page.content()) {
                    UUID stableId = stableUuidFromLong(dto.id());
                    courseRepository.findById(stableId).ifPresentOrElse(
                            existing -> {
                                existing.setTitle(dto.title());
                                existing.setLevel(dto.level());
                            },
                            () -> courseRepository.save(CourseEntity.builder()
                                    .id(stableId)
                                    .title(dto.title())
                                    .level(dto.level())
                                    .build())
                    );
                }
            }
        } catch (Exception e) {
            log.warn("Could not sync courses from course-resource-service, serving local cache: {}", e.getMessage());
        }
        return courseRepository.findAll();
    }

    public List<CourseEntity> list() {
        return courseRepository.findAll();
    }

    public CourseEntity get(UUID courseId) {
        return courseRepository.findById(courseId).orElseThrow(() -> new NotFoundException("Course not found"));
    }

    @Transactional
    public CourseEntity create(CreateCourseCommand cmd) {
        CourseEntity course = CourseEntity.builder()
                .id(UUID.randomUUID())
                .title(cmd.title())
                .level(cmd.level())
                .startDate(cmd.startDate())
                .build();
        return courseRepository.save(course);
    }

    @Transactional
    public void delete(UUID courseId) {
        CourseEntity course = get(courseId);
        try {
            courseRepository.delete(course);
            courseRepository.flush();
        } catch (DataIntegrityViolationException e) {
            throw new BadRequestException("Cannot delete course: it is referenced by other data");
        }
    }

    /**
     * Derives a stable, deterministic UUID v3 from a course-resource-service Long ID.
     * The same Long always maps to the same UUID, so re-syncing never creates duplicates.
     */
    private static UUID stableUuidFromLong(long id) {
        ByteBuffer buf = ByteBuffer.allocate(8);
        buf.putLong(id);
        return UUID.nameUUIDFromBytes(buf.array());
    }

    public record CreateCourseCommand(String title, String level, OffsetDateTime startDate) {
    }
}

