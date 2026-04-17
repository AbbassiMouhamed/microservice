package com.smartlingua.adaptive.dto.external;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.ArrayList;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ChapterExternalDto {
    private Long id;
    private String title;
    private String description;
    private String skillType;
    private Integer orderIndex;
    private boolean required;
    private List<ChapterContentExternalDto> contents = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getSkillType() { return skillType; }
    public void setSkillType(String skillType) { this.skillType = skillType; }
    public Integer getOrderIndex() { return orderIndex; }
    public void setOrderIndex(Integer orderIndex) { this.orderIndex = orderIndex; }
    public boolean isRequired() { return required; }
    public void setRequired(boolean required) { this.required = required; }
    public List<ChapterContentExternalDto> getContents() { return contents; }
    public void setContents(List<ChapterContentExternalDto> contents) { this.contents = contents; }
}
