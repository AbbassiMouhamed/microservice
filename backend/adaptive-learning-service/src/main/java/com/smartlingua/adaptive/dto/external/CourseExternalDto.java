package com.smartlingua.adaptive.dto.external;

import com.smartlingua.adaptive.entity.enums.CourseLevel;

public class CourseExternalDto {
    private Long id;
    private String title;
    private String description;
    private CourseLevel level;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public CourseLevel getLevel() { return level; }
    public void setLevel(CourseLevel level) { this.level = level; }
}
