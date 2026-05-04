package com.smartlingua.gateway;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class ApiGatewaySmokeTest {

    @Test
    void apiPrefixShouldBeStable() {
        String apiPrefix = "/api";
        assertTrue(apiPrefix.startsWith("/"));
        assertEquals("/api", apiPrefix);
    }
}
