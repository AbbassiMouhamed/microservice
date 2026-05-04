package com.smartlingua.examcert;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class ExamCertServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ExamCertServiceApplication.class, args);
    }
}
