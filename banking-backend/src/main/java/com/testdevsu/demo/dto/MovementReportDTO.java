package com.testdevsu.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MovementReportDTO {
    private LocalDateTime date;
    private String movementType;
    private Double value;
    private Double balance;
}
