package com.smartlingua.messaging.dto;

public class CreateInvitationRequest {
    private Long senderId;
    private Long receiverId;
    private String message;
    private String invitationType;

    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }
    public Long getReceiverId() { return receiverId; }
    public void setReceiverId(Long receiverId) { this.receiverId = receiverId; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getInvitationType() { return invitationType; }
    public void setInvitationType(String invitationType) { this.invitationType = invitationType; }
}
