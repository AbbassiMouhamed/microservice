package com.smartlingua.forum.service;

import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.regex.Pattern;

@Service
public class ContentModerationService {

    private static final Set<String> BLOCKED_TERMS = Set.of(
            "spam", "scam", "hate", "insult"
    );

    private static final Pattern BLOCKED_PATTERN;

    static {
        String joined = String.join("|", BLOCKED_TERMS);
        BLOCKED_PATTERN = Pattern.compile("\\b(" + joined + ")\\b", Pattern.CASE_INSENSITIVE);
    }

    public boolean containsBlockedContent(String text) {
        if (text == null || text.isBlank()) return false;
        return BLOCKED_PATTERN.matcher(text).find();
    }
}
