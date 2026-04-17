package com.smartlingua.messaging.dto;

import java.util.ArrayList;
import java.util.List;

public class ChatbotMessageResponse {
    private String reply;
    private String levelUsed;
    private boolean levelRequired;
    private List<ResourceDto> resources = new ArrayList<>();

    public ChatbotMessageResponse() {}
    public ChatbotMessageResponse(String reply, String levelUsed, boolean levelRequired, List<ResourceDto> resources) {
        this.reply = reply;
        this.levelUsed = levelUsed;
        this.levelRequired = levelRequired;
        this.resources = resources;
    }

    public String getReply() { return reply; }
    public void setReply(String reply) { this.reply = reply; }
    public String getLevelUsed() { return levelUsed; }
    public void setLevelUsed(String levelUsed) { this.levelUsed = levelUsed; }
    public boolean isLevelRequired() { return levelRequired; }
    public void setLevelRequired(boolean levelRequired) { this.levelRequired = levelRequired; }
    public List<ResourceDto> getResources() { return resources; }
    public void setResources(List<ResourceDto> resources) { this.resources = resources; }
}
