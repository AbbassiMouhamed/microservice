package com.smartlingua.adaptive.dto.external;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class QuizLevelFinalResultDto {
    private long attemptId;
    private boolean completed;
    private int scorePercent;
    private boolean passed;
    private String keycloakSubject;
    private String weakAreasAuto;

    public long getAttemptId() { return attemptId; }
    public void setAttemptId(long attemptId) { this.attemptId = attemptId; }
    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }
    public int getScorePercent() { return scorePercent; }
    public void setScorePercent(int scorePercent) { this.scorePercent = scorePercent; }
    public boolean isPassed() { return passed; }
    public void setPassed(boolean passed) { this.passed = passed; }
    public String getKeycloakSubject() { return keycloakSubject; }
    public void setKeycloakSubject(String keycloakSubject) { this.keycloakSubject = keycloakSubject; }
    public String getWeakAreasAuto() { return weakAreasAuto; }
    public void setWeakAreasAuto(String weakAreasAuto) { this.weakAreasAuto = weakAreasAuto; }
}
