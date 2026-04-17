package com.smartlingua.adaptive.config;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;

public class KeycloakRealmRoleConverter implements Converter<Jwt, Collection<GrantedAuthority>> {

    @Override
    @SuppressWarnings("unchecked")
    public Collection<GrantedAuthority> convert(Jwt jwt) {
        List<GrantedAuthority> out = new ArrayList<>();

        Map<String, Object> realmAccess = jwt.getClaimAsMap("realm_access");
        if (realmAccess != null) {
            addRolesFromClaim(out, realmAccess.get("roles"));
        }

        Map<String, Object> resourceAccess = jwt.getClaimAsMap("resource_access");
        if (resourceAccess != null) {
            for (Object clientVal : resourceAccess.values()) {
                if (clientVal instanceof Map<?, ?> clientMap) {
                    addRolesFromClaim(out, clientMap.get("roles"));
                }
            }
        }

        Object groupsClaim = jwt.getClaim("groups");
        if (groupsClaim instanceof Collection<?>) {
            addRolesFromClaim(out, groupsClaim);
        }

        for (GrantedAuthority g : new ArrayList<>(out)) {
            String a = g.getAuthority();
            if ("ROLE_student".equalsIgnoreCase(a) || "student".equalsIgnoreCase(a)
                    || "ROLE_STUDENT".equalsIgnoreCase(a)) {
                out.add(new SimpleGrantedAuthority("ROLE_STUDENT"));
                out.add(new SimpleGrantedAuthority("student"));
                out.add(new SimpleGrantedAuthority("ROLE_student"));
            }
            if ("ROLE_admin".equalsIgnoreCase(a) || "admin".equalsIgnoreCase(a)
                    || "ROLE_ADMIN".equalsIgnoreCase(a)) {
                out.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
                out.add(new SimpleGrantedAuthority("admin"));
                out.add(new SimpleGrantedAuthority("ROLE_admin"));
            }
            if ("ROLE_teacher".equalsIgnoreCase(a) || "teacher".equalsIgnoreCase(a)
                    || "ROLE_TEACHER".equalsIgnoreCase(a)) {
                out.add(new SimpleGrantedAuthority("ROLE_TEACHER"));
                out.add(new SimpleGrantedAuthority("teacher"));
                out.add(new SimpleGrantedAuthority("ROLE_teacher"));
            }
        }

        for (GrantedAuthority g : new ArrayList<>(out)) {
            String a = g.getAuthority();
            if (a == null) continue;
            String norm = normalizeRole(a);
            if (norm.equals("etudiant") || norm.equals("eleve")) {
                out.add(new SimpleGrantedAuthority("ROLE_STUDENT"));
                out.add(new SimpleGrantedAuthority("student"));
                out.add(new SimpleGrantedAuthority("ROLE_student"));
            }
            if (norm.equals("enseignant") || norm.equals("professeur") || norm.equals("formateur")) {
                out.add(new SimpleGrantedAuthority("ROLE_TEACHER"));
                out.add(new SimpleGrantedAuthority("teacher"));
                out.add(new SimpleGrantedAuthority("ROLE_teacher"));
            }
        }

        return out.isEmpty() ? Collections.emptyList() : out;
    }

    private static String normalizeRole(String authority) {
        String s = authority.replace("ROLE_", "").replace("role_", "");
        if (s.startsWith("/")) s = s.substring(1);
        return s.toLowerCase().replace("é", "e");
    }

    private static void addRolesFromClaim(List<GrantedAuthority> out, Object rolesObj) {
        if (!(rolesObj instanceof Collection<?> raw)) return;
        for (Object r : raw) {
            if (r == null) continue;
            String name = r.toString();
            out.add(new SimpleGrantedAuthority("ROLE_" + name));
            out.add(new SimpleGrantedAuthority(name));
        }
    }
}
