package com.smartlingua.messaging.dto;

public class ChatbotMessageRequest {
    private Long userId;
    private String message;
    private String level;

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }
}
