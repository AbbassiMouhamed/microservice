package com.smartlingua.adaptive.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import java.util.List;

@Component("adaptiveAuth")
public class AdaptiveAuthorizationService {
    @Value("${adaptive.security.relaxed-student-check:true}")
    private boolean relaxedStudentCheck;

    public boolean canAccessStudent(Long studentId, Authentication authentication) {
        if (studentId == null || authentication == null || !authentication.isAuthenticated()) return false;
        if (isStaff(authentication)) return true;
        if (relaxedStudentCheck) return true;
        Long tokenStudentId = extractStudentId(authentication);
        return tokenStudentId != null && tokenStudentId.equals(studentId);
    }

    public boolean isStaff(Authentication authentication) {
        if (authentication == null) return false;
        return authentication.getAuthorities().stream().anyMatch(a -> isStaffAuthority(a.getAuthority()));
    }

    private static boolean isStaffAuthority(String auth) {
        if (auth == null) return false;
        String u = auth.toUpperCase();
        return u.contains("TEACHER") || u.contains("ENSEIGNANT") || u.contains("FORMATEUR") || u.contains("ADMIN");
    }

    private static Long extractStudentId(Authentication authentication) {
        if (!(authentication.getPrincipal() instanceof Jwt jwt)) return null;
        for (String claim : List.of("student_id", "studentId", "user_id", "userId")) {
            Object v = jwt.getClaim(claim);
            if (v instanceof Number n) return n.longValue();
            if (v instanceof String s) {
                try { return Long.parseLong(s); } catch (NumberFormatException ignored) {}
            }
        }
        String sub = jwt.getSubject();
        if (sub == null) return null;
        // Derive same stable ID as JwtUserResolver
        return Math.abs(sub.hashCode()) + 1L;
    }
}
