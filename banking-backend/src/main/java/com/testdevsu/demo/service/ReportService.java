package com.testdevsu.demo.service;

import java.time.LocalDateTime;

public interface ReportService {
    String generateAccountStatement(Long clientId, LocalDateTime startDate, 
                                   LocalDateTime endDate, String format);
}
