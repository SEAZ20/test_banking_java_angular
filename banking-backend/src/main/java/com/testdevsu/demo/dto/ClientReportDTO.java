package com.testdevsu.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ClientReportDTO {
    private String clientName;
    private String clientId;
    private String startDate;
    private String endDate;
    private List<AccountReportDTO> accounts;
}
