package com.smartlingua.course.service;

import com.smartlingua.course.domain.*;
import com.smartlingua.course.dto.*;
import com.smartlingua.course.repository.ChapterRepository;
import com.smartlingua.course.repository.CourseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ChapterService {

    private final ChapterRepository chapterRepo;
    private final CourseRepository courseRepo;

    public ChapterService(ChapterRepository chapterRepo, CourseRepository courseRepo) {
        this.chapterRepo = chapterRepo;
        this.courseRepo = courseRepo;
    }

    @Transactional(readOnly = true)
    public List<ChapterDto> findByCourse(Long courseId) {
        return chapterRepo.findByCourseIdOrderByOrderIndex(courseId).stream()
                .map(this::toDto).toList();
    }

    public ChapterDto create(Long courseId, ChapterDto dto) {
        Course course = courseRepo.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found: " + courseId));
        Chapter ch = new Chapter();
        ch.setTitle(dto.title());
        ch.setDescription(dto.description());
        ch.setSkillType(dto.skillType());
        ch.setOrderIndex(dto.orderIndex() != null ? dto.orderIndex() : 0);
        ch.setRequired(dto.required());
        ch.setCourse(course);

        if (dto.contents() != null) {
            for (ChapterContentDto cd : dto.contents()) {
                ChapterContent content = new ChapterContent();
                content.setType(cd.type());
                content.setTitle(cd.title());
                content.setUrl(cd.url());
                content.setRequired(cd.required());
                content.setChapter(ch);
                ch.getContents().add(content);
            }
        }

        return toDto(chapterRepo.save(ch));
    }

    public void delete(Long id) {
        chapterRepo.deleteById(id);
    }

    private ChapterDto toDto(Chapter ch) {
        List<ChapterContentDto> contents = ch.getContents().stream()
                .map(c -> new ChapterContentDto(c.getId(), c.getType(), c.getTitle(), c.getUrl(), c.isRequired()))
                .toList();
        return new ChapterDto(ch.getId(), ch.getTitle(), ch.getDescription(),
                ch.getSkillType(), ch.getOrderIndex(), ch.isRequired(), contents);
    }
}
