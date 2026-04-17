package com.smartlingua.forum.service;

import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

@Component
public class JwtHelper {

    public String getUserId(Jwt jwt) {
        return jwt.getSubject();
    }

    public String getUserName(Jwt jwt) {
        String name = jwt.getClaimAsString("preferred_username");
        return name != null ? name : jwt.getSubject();
    }

    public boolean hasRole(Jwt jwt, String role) {
        var realmAccess = jwt.getClaimAsMap("realm_access");
        if (realmAccess == null) return false;
        Object roles = realmAccess.get("roles");
        if (roles instanceof java.util.Collection<?> col) {
            return col.stream().anyMatch(r -> role.equals(r));
        }
        return false;
    }

    public boolean isAdminOrTeacher(Jwt jwt) {
        return hasRole(jwt, "ADMIN") || hasRole(jwt, "TEACHER");
    }
}
