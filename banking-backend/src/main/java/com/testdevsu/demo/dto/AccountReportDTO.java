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
public class AccountReportDTO {
    private String accountNumber;
    private String accountType;
    private Double initialBalance;
    private Boolean status;
    private Double totalCredits;
    private Double totalDebits;
    private Double availableBalance;
    private List<MovementReportDTO> movements;
}
