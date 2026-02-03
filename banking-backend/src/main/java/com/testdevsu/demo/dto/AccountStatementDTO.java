package com.testdevsu.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AccountStatementDTO {
    private String date;
    private String client;
    private String accountNumber;
    private String type;
    private Double initialBalance;
    private Boolean status;
    private String movement;
    private Double availableBalance;
}
