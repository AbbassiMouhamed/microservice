package com.smartlingua.adaptive.feign;

import com.smartlingua.adaptive.dto.external.QuizLevelFinalResultDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "quiz-service", configuration = {FeignBearerTokenConfig.class, FeignClientJacksonConfig.class})
public interface QuizClient {
    @GetMapping("/api/quiz/level-final/attempts/{attemptId}")
    QuizLevelFinalResultDto getLevelFinalAttempt(@PathVariable("attemptId") long attemptId);
}
