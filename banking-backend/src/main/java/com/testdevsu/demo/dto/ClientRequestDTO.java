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
public class ClientRequestDTO {
    @NotBlank(message = "El nombre es requerido")
    @Size(max = 100, message = "El nombre no debe exceder 100 caracteres")
    private String name;
    
    @Size(max = 20, message = "El género no debe exceder 20 caracteres")
    private String gender;
    
    @Min(value = 0, message = "La edad debe ser positiva")
    private Integer age;
    
    @NotBlank(message = "La identificación es requerida")
    @Size(max = 20, message = "La identificación no debe exceder 20 caracteres")
    private String identification;
    
    @Size(max = 200, message = "La dirección no debe exceder 200 caracteres")
    private String address;
    
    @Size(max = 20, message = "El teléfono no debe exceder 20 caracteres")
    private String phone;
    
    @NotBlank(message = "El clientId es requerido")
    @Size(max = 50, message = "El clientId no debe exceder 50 caracteres")
    private String clientId;
    
    private String password;
    
    private Boolean status;
}
