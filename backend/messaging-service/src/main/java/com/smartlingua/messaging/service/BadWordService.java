package com.smartlingua.messaging.service;

import com.smartlingua.messaging.entity.BadWord;
import com.smartlingua.messaging.entity.UserBan;
import com.smartlingua.messaging.repository.BadWordRepository;
import com.smartlingua.messaging.repository.UserBanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
public class BadWordService {

    private static final int BAN_MINUTES = 10;

    @Autowired
    private BadWordRepository badWordRepository;

    @Autowired
    private UserBanRepository userBanRepository;

    public boolean isBanned(Long userId) {
        return userBanRepository.findActiveBan(userId, LocalDateTime.now()).isPresent();
    }

    public LocalDateTime getBannedUntil(Long userId) {
        return userBanRepository.findActiveBan(userId, LocalDateTime.now())
                .map(UserBan::getBannedUntil)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public FilterResult filterContent(String content) {
        if (content == null || content.isEmpty()) {
            return new FilterResult(content, false);
        }
        List<BadWord> badWords = badWordRepository.findAllByOrderByWordAsc();
        if (badWords.isEmpty()) {
            return new FilterResult(content, false);
        }
        String lower = content.toLowerCase(Locale.ROOT);
        String result = content;
        boolean found = false;
        for (BadWord bw : badWords) {
            String word = bw.getWord();
            if (word == null || word.isEmpty()) continue;
            String replacement = "*".repeat(word.length());
            if (lower.contains(word)) {
                found = true;
                result = Pattern.compile(Pattern.quote(word), Pattern.CASE_INSENSITIVE)
                        .matcher(result)
                        .replaceAll(replacement);
            }
        }
        return new FilterResult(result, found);
    }

    @Transactional
    public void banUser(Long userId) {
        LocalDateTime until = LocalDateTime.now().plusMinutes(BAN_MINUTES);
        UserBan ban = userBanRepository.findByUserId(userId).orElse(null);
        if (ban != null) {
            if (ban.getBannedUntil().isBefore(until)) {
                ban.setBannedUntil(until);
                userBanRepository.save(ban);
            }
        } else {
            userBanRepository.save(new UserBan(userId, until));
        }
    }

    public static final class FilterResult {
        private final String content;
        private final boolean hadBadWord;

        public FilterResult(String content, boolean hadBadWord) {
            this.content = content;
            this.hadBadWord = hadBadWord;
        }

        public String getContent() { return content; }
        public boolean hadBadWord() { return hadBadWord; }
    }
}
