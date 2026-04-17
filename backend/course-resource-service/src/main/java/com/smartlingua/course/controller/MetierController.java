package com.smartlingua.course.controller;

import com.smartlingua.course.dto.SeanceDto;
import com.smartlingua.course.dto.StatisticsDto;
import com.smartlingua.course.service.SeanceService;
import com.smartlingua.course.service.StatisticsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/metier")
public class MetierController {

    private final StatisticsService statisticsService;
    private final SeanceService seanceService;

    public MetierController(StatisticsService statisticsService, SeanceService seanceService) {
        this.statisticsService = statisticsService;
        this.seanceService = seanceService;
    }

    @GetMapping("/statistics")
    public StatisticsDto statistics() {
        return statisticsService.getStatistics();
    }

    @GetMapping("/upcoming-seances")
    public List<SeanceDto> upcomingSeances() {
        return seanceService.findUpcoming();
    }
}
