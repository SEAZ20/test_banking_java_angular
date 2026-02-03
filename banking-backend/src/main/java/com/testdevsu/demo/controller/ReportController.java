package com.testdevsu.demo.controller;

import com.testdevsu.demo.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/reportes")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping
    public ResponseEntity<String> getAccountStatement(
            @RequestParam Long clientId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "json") String format) {

        String report = reportService.generateAccountStatement(clientId, startDate, endDate, format);

        HttpHeaders headers = new HttpHeaders();
        
        if ("pdf".equalsIgnoreCase(format)) {
            headers.setContentType(MediaType.TEXT_PLAIN);
            return new ResponseEntity<>(report, headers, HttpStatus.OK);
        } else {
            headers.setContentType(MediaType.APPLICATION_JSON);
            return new ResponseEntity<>(report, headers, HttpStatus.OK);
        }
    }
}
