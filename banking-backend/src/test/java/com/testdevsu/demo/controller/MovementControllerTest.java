package com.testdevsu.demo.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.testdevsu.demo.dto.MovementRequestDTO;
import com.testdevsu.demo.dto.MovementResponseDTO;
import com.testdevsu.demo.exception.InsufficientBalanceException;
import com.testdevsu.demo.exception.ResourceNotFoundException;
import com.testdevsu.demo.service.MovementService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(MovementController.class)
class MovementControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private MovementService movementService;

    @Autowired
    private ObjectMapper objectMapper;

    private MovementResponseDTO movementResponse;
    private MovementRequestDTO movementRequest;
    private LocalDateTime testDate;

    @BeforeEach
    void setUp() {
        testDate = LocalDateTime.of(2024, 2, 10, 10, 30, 0);
        
        movementResponse = new MovementResponseDTO(
                1L,
                testDate,
                "Retiro",
                -575.0,
                1425.0,
                1L,
                "478758"
        );

        movementRequest = new MovementRequestDTO(
                testDate,
                "Retiro",
                -575.0,
                1L
        );
    }

    @Test
    void getAllMovements_ShouldReturnListOfMovements() throws Exception {
        MovementResponseDTO movement2 = new MovementResponseDTO(
                2L,
                testDate,
                "Depósito",
                600.0,
                700.0,
                2L,
                "225487"
        );
        List<MovementResponseDTO> movements = Arrays.asList(movementResponse, movement2);
        when(movementService.getAllMovements()).thenReturn(movements);

        mockMvc.perform(get("/movements")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].id", is(1)))
                .andExpect(jsonPath("$[0].movementType", is("Retiro")))
                .andExpect(jsonPath("$[0].value", is(-575.0)))
                .andExpect(jsonPath("$[0].balance", is(1425.0)))
                .andExpect(jsonPath("$[1].id", is(2)))
                .andExpect(jsonPath("$[1].movementType", is("Depósito")));

        verify(movementService, times(1)).getAllMovements();
    }

    @Test
    void getMovementById_WhenMovementExists_ShouldReturnMovement() throws Exception {
        when(movementService.getMovementById(1L)).thenReturn(movementResponse);

        mockMvc.perform(get("/movements/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.movementType", is("Retiro")))
                .andExpect(jsonPath("$.value", is(-575.0)))
                .andExpect(jsonPath("$.balance", is(1425.0)))
                .andExpect(jsonPath("$.accountId", is(1)))
                .andExpect(jsonPath("$.accountNumber", is("478758")));

        verify(movementService, times(1)).getMovementById(1L);
    }

    @Test
    void getMovementById_WhenMovementNotFound_ShouldReturnNotFound() throws Exception {
        when(movementService.getMovementById(999L)).thenThrow(new ResourceNotFoundException("Movimiento no encontrado"));

        mockMvc.perform(get("/movements/999")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        verify(movementService, times(1)).getMovementById(999L);
    }

    @Test
    void createMovement_WithValidData_ShouldReturnCreatedMovement() throws Exception {
        when(movementService.createMovement(any(MovementRequestDTO.class))).thenReturn(movementResponse);

        mockMvc.perform(post("/movements")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(movementRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.movementType", is("Retiro")))
                .andExpect(jsonPath("$.value", is(-575.0)))
                .andExpect(jsonPath("$.balance", is(1425.0)));

        verify(movementService, times(1)).createMovement(any(MovementRequestDTO.class));
    }

    @Test
    void createMovement_WithInvalidData_ShouldReturnBadRequest() throws Exception {
        MovementRequestDTO invalidRequest = new MovementRequestDTO();
        invalidRequest.setMovementType(""); // Tipo de movimiento vacío
        invalidRequest.setValue(null); // Valor nulo
        invalidRequest.setAccountId(null); // Account ID nulo

        mockMvc.perform(post("/movements")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());

        verify(movementService, never()).createMovement(any(MovementRequestDTO.class));
    }

    @Test
    void createMovement_WithInsufficientBalance_ShouldReturnBadRequest() throws Exception {
        when(movementService.createMovement(any(MovementRequestDTO.class)))
                .thenThrow(new InsufficientBalanceException("Saldo no disponible"));

        mockMvc.perform(post("/movements")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(movementRequest)))
                .andExpect(status().isBadRequest());

        verify(movementService, times(1)).createMovement(any(MovementRequestDTO.class));
    }

    @Test
    void updateMovement_WhenMovementExists_ShouldReturnUpdatedMovement() throws Exception {
        MovementResponseDTO updatedResponse = new MovementResponseDTO(
                1L,
                testDate,
                "Depósito",
                600.0,
                2600.0,
                1L,
                "478758"
        );
        when(movementService.updateMovement(eq(1L), any(MovementRequestDTO.class))).thenReturn(updatedResponse);

        MovementRequestDTO updateRequest = new MovementRequestDTO(
                testDate,
                "Depósito",
                600.0,
                1L
        );

        mockMvc.perform(put("/movements/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.movementType", is("Depósito")))
                .andExpect(jsonPath("$.value", is(600.0)))
                .andExpect(jsonPath("$.balance", is(2600.0)));

        verify(movementService, times(1)).updateMovement(eq(1L), any(MovementRequestDTO.class));
    }

    @Test
    void partialUpdateMovement_ShouldReturnPartiallyUpdatedMovement() throws Exception {
        MovementResponseDTO updatedResponse = new MovementResponseDTO(
                1L,
                testDate,
                "Retiro de cajero",
                -575.0,
                1425.0,
                1L,
                "478758"
        );
        when(movementService.partialUpdateMovement(eq(1L), any(MovementRequestDTO.class))).thenReturn(updatedResponse);

        MovementRequestDTO partialRequest = new MovementRequestDTO();
        partialRequest.setMovementType("Retiro de cajero");

        mockMvc.perform(patch("/movements/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(partialRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.movementType", is("Retiro de cajero")));

        verify(movementService, times(1)).partialUpdateMovement(eq(1L), any(MovementRequestDTO.class));
    }

    @Test
    void deleteMovement_WhenMovementExists_ShouldReturnNoContent() throws Exception {
        doNothing().when(movementService).deleteMovement(1L);

        mockMvc.perform(delete("/movements/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(movementService, times(1)).deleteMovement(1L);
    }

    @Test
    void deleteMovement_WhenMovementNotFound_ShouldReturnNotFound() throws Exception {
        doThrow(new ResourceNotFoundException("Movimiento no encontrado")).when(movementService).deleteMovement(999L);

        mockMvc.perform(delete("/movements/999")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        verify(movementService, times(1)).deleteMovement(999L);
    }
}
