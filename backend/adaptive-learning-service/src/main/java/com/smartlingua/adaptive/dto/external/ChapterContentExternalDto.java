package com.smartlingua.adaptive.dto.external;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ChapterContentExternalDto {
    private Long id;
    private String type;
    private String title;
    private String url;
    private boolean required;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public boolean isRequired() { return required; }
    public void setRequired(boolean required) { this.required = required; }
}
