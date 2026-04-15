package com.smartlingua.examcert.service;

import com.smartlingua.examcert.domain.SkillLevel;
import org.springframework.stereotype.Service;

@Service
public class SkillLevelCalculator {

    public SkillLevel fromScore(int score, int maxScore) {
        if (maxScore <= 0) {
            throw new IllegalArgumentException("maxScore must be > 0");
        }
        int pct = (int) Math.round((score * 100.0) / maxScore);
        if (pct < 50) {
            return SkillLevel.A1;
        }
        if (pct < 60) {
            return SkillLevel.A2;
        }
        if (pct < 70) {
            return SkillLevel.B1;
        }
        if (pct < 80) {
            return SkillLevel.B2;
        }
        if (pct < 90) {
            return SkillLevel.C1;
        }
        return SkillLevel.C2;
    }
}
