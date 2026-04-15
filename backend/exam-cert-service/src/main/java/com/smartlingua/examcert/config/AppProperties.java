package com.smartlingua.examcert.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppProperties(SigningProperties signing) {

    public record SigningProperties(String keysDir) {
    }
}
