package com.testdevsu.demo.config;

import com.testdevsu.demo.dto.ClientReportDTO;

public interface ReportFormatter {
    String format(ClientReportDTO reportData);
}
