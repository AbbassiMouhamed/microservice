package com.smartlingua.messaging.dto;

public class ConversationMessageRequest {
    private Long senderId;
    private String content;

    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
