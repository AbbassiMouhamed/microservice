package com.smartlingua.course.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "cr_chapter_contents")
public class ChapterContent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ChapterContentKind type;

    private String title;

    @Column(length = 2000)
    private String url;

    @Column(nullable = false)
    private boolean required = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chapter_id", nullable = false)
    private Chapter chapter;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ChapterContentKind getType() { return type; }
    public void setType(ChapterContentKind type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public boolean isRequired() { return required; }
    public void setRequired(boolean required) { this.required = required; }

    public Chapter getChapter() { return chapter; }
    public void setChapter(Chapter chapter) { this.chapter = chapter; }
}
