package com.smartlingua.messaging.dto;

public class ResourceDto {
    private Long id;
    private String title;
    private String description;
    private String level;
    private String category;
    private String url;

    public ResourceDto() {}
    public ResourceDto(Long id, String title, String description, String level, String category, String url) {
        this.id = id; this.title = title; this.description = description;
        this.level = level; this.category = category; this.url = url;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
}
