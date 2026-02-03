package com.testdevsu.demo.config;

import com.testdevsu.demo.dto.ClientReportDTO;

// Patrón Strategy - Interface para diferentes formatos de reporte
public interface ReportFormatter {
    String format(ClientReportDTO reportData);
    String getContentType();
}
