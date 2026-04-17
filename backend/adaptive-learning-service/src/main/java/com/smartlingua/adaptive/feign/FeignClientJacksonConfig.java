package com.smartlingua.adaptive.feign;

import com.fasterxml.jackson.databind.ObjectMapper;
import feign.codec.Decoder;
import feign.jackson.JacksonDecoder;
import org.springframework.context.annotation.Bean;

public class FeignClientJacksonConfig {
    @Bean
    Decoder feignJacksonDecoder(ObjectMapper objectMapper) {
        return new JacksonDecoder(objectMapper);
    }
}
