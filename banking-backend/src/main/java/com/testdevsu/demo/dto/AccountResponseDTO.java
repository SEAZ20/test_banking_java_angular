package com.testdevsu.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AccountResponseDTO {
    private Long id;
    private String accountNumber;
    private String accountType;
    private Double initialBalance;
    private Double currentBalance;
    private Boolean status;
    private Long clientId;
    private String clientName;
}
