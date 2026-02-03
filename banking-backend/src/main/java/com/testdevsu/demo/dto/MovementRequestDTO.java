package com.testdevsu.demo.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MovementRequestDTO {
    private LocalDateTime date;
    
    @NotBlank(message = "El tipo de movimiento es requerido")
    @Size(max = 50, message = "El tipo de movimiento no debe exceder 50 caracteres")
    private String movementType;
    
    @NotNull(message = "El valor es requerido")
    private Double value;
    
    @NotNull(message = "El ID de la cuenta es requerido")
    private Long accountId;
}
