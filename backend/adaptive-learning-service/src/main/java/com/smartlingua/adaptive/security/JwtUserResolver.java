package com.smartlingua.adaptive.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

/**
 * Resolves the application user ID from the JWT token.
 * Since we use Keycloak without a local app_user table, we derive
 * a stable numeric ID from the Keycloak subject UUID.
 */
@Component
public class JwtUserResolver {

    public long requireAppUserId(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
            throw new IllegalStateException("JWT token missing");
        }
        String sub = jwt.getSubject();
        if (sub == null || sub.isBlank()) {
            throw new IllegalStateException("JWT subject is missing");
        }
        // Derive a stable positive Long from the Keycloak UUID subject
        return Math.abs(sub.hashCode()) + 1L;
    }

    public String getDisplayName(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
            return "Unknown";
        }
        String name = jwt.getClaimAsString("preferred_username");
        if (name != null && !name.isBlank()) return name;
        name = jwt.getClaimAsString("name");
        if (name != null && !name.isBlank()) return name;
        String given = jwt.getClaimAsString("given_name");
        String family = jwt.getClaimAsString("family_name");
        if (given != null || family != null) {
            return ((given != null ? given : "") + " " + (family != null ? family : "")).trim();
        }
        return jwt.getSubject();
    }

    public String getEmail(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
            return "";
        }
        String email = jwt.getClaimAsString("email");
        return email != null ? email : "";
    }
}
