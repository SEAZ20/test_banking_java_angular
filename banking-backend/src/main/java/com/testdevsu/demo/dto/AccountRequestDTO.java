package com.testdevsu.demo.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AccountRequestDTO {
    @NotBlank(message = "El número de cuenta es requerido")
    @Size(max = 20, message = "El número de cuenta no debe exceder 20 caracteres")
    private String accountNumber;
    
    @NotBlank(message = "El tipo de cuenta es requerido")
    @Size(max = 50, message = "El tipo de cuenta no debe exceder 50 caracteres")
    private String accountType;
    
    @NotNull(message = "El saldo inicial es requerido")
    private Double initialBalance;
    
    private Boolean status;
    
    @NotNull(message = "El ID del cliente es requerido")
    private Long clientId;
}
