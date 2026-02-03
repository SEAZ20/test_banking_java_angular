package com.testdevsu.demo.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.testdevsu.demo.dto.ClientRequestDTO;
import com.testdevsu.demo.dto.ClientResponseDTO;
import com.testdevsu.demo.exception.ResourceNotFoundException;
import com.testdevsu.demo.service.ClientService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.never;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ClientController.class)
class ClientControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ClientService clientService;

    @Autowired
    private ObjectMapper objectMapper;

    private ClientResponseDTO clientResponse;
    private ClientRequestDTO clientRequest;

    @BeforeEach
    void setUp() {
        clientResponse = new ClientResponseDTO(
                1L,
                "Jose Lema",
                "Masculino",
                30,
                "1234567890",
                "Otavalo sn y principal",
                "098254785",
                "jose-lema",
                true
        );

        clientRequest = new ClientRequestDTO(
                "Jose Lema",
                "Masculino",
                30,
                "1234567890",
                "Otavalo sn y principal",
                "098254785",
                "jose-lema",
                "1234",
                true
        );
    }

    @Test
    void getAllClients_ShouldReturnListOfClients() throws Exception {
        ClientResponseDTO client2 = new ClientResponseDTO(
                2L,
                "Marianela Montalvo",
                "Femenino",
                25,
                "0987654321",
                "Amazonas y NNUU",
                "097548965",
                "marianela-montalvo",
                true
        );
        List<ClientResponseDTO> clients = Arrays.asList(clientResponse, client2);
        when(clientService.getAllClients()).thenReturn(clients);

        mockMvc.perform(get("/clients")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].id", is(1)))
                .andExpect(jsonPath("$[0].name", is("Jose Lema")))
                .andExpect(jsonPath("$[0].clientId", is("jose-lema")))
                .andExpect(jsonPath("$[1].id", is(2)))
                .andExpect(jsonPath("$[1].name", is("Marianela Montalvo")));

        verify(clientService, times(1)).getAllClients();
    }

    @Test
    void getClientById_WhenClientExists_ShouldReturnClient() throws Exception {
        when(clientService.getClientById(1L)).thenReturn(clientResponse);

        mockMvc.perform(get("/clients/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.name", is("Jose Lema")))
                .andExpect(jsonPath("$.gender", is("Masculino")))
                .andExpect(jsonPath("$.age", is(30)))
                .andExpect(jsonPath("$.identification", is("1234567890")))
                .andExpect(jsonPath("$.clientId", is("jose-lema")))
                .andExpect(jsonPath("$.status", is(true)));

        verify(clientService, times(1)).getClientById(1L);
    }

    @Test
    void getClientById_WhenClientNotFound_ShouldReturnNotFound() throws Exception {
        when(clientService.getClientById(999L)).thenThrow(new ResourceNotFoundException("Cliente no encontrado"));

        mockMvc.perform(get("/clients/999")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        verify(clientService, times(1)).getClientById(999L);
    }

    @Test
    void createClient_WithValidData_ShouldReturnCreatedClient() throws Exception {
        when(clientService.createClient(any(ClientRequestDTO.class))).thenReturn(clientResponse);

        mockMvc.perform(post("/clients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(clientRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.name", is("Jose Lema")))
                .andExpect(jsonPath("$.clientId", is("jose-lema")));

        verify(clientService, times(1)).createClient(any(ClientRequestDTO.class));
    }

    @Test
    void createClient_WithInvalidData_ShouldReturnBadRequest() throws Exception {
        ClientRequestDTO invalidRequest = new ClientRequestDTO();
        invalidRequest.setName(""); // Nombre vacío - violación de validación

        mockMvc.perform(post("/clients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());

        verify(clientService, never()).createClient(any(ClientRequestDTO.class));
    }

    @Test
    void updateClient_WhenClientExists_ShouldReturnUpdatedClient() throws Exception {
        ClientResponseDTO updatedResponse = new ClientResponseDTO(
                1L,
                "Jose Lema Updated",
                "Masculino",
                31,
                "1234567890",
                "Nueva Direccion",
                "098254785",
                "jose-lema",
                true
        );
        when(clientService.updateClient(eq(1L), any(ClientRequestDTO.class))).thenReturn(updatedResponse);

        ClientRequestDTO updateRequest = new ClientRequestDTO(
                "Jose Lema Updated",
                "Masculino",
                31,
                "1234567890",
                "Nueva Direccion",
                "098254785",
                "jose-lema",
                "1234",
                true
        );

        mockMvc.perform(put("/clients/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.name", is("Jose Lema Updated")))
                .andExpect(jsonPath("$.age", is(31)))
                .andExpect(jsonPath("$.address", is("Nueva Direccion")));

        verify(clientService, times(1)).updateClient(eq(1L), any(ClientRequestDTO.class));
    }

    @Test
    void partialUpdateClient_ShouldReturnPartiallyUpdatedClient() throws Exception {
        ClientResponseDTO updatedResponse = new ClientResponseDTO(
                1L,
                "Jose Lema",
                "Masculino",
                30,
                "1234567890",
                "Nueva Direccion Parcial",
                "098254785",
                "jose-lema",
                true
        );
        when(clientService.partialUpdateClient(eq(1L), any(ClientRequestDTO.class))).thenReturn(updatedResponse);

        ClientRequestDTO partialRequest = new ClientRequestDTO();
        partialRequest.setAddress("Nueva Direccion Parcial");

        mockMvc.perform(patch("/clients/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(partialRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.address", is("Nueva Direccion Parcial")));

        verify(clientService, times(1)).partialUpdateClient(eq(1L), any(ClientRequestDTO.class));
    }

    @Test
    void deleteClient_WhenClientExists_ShouldReturnNoContent() throws Exception {
        doNothing().when(clientService).deleteClient(1L);

        mockMvc.perform(delete("/clients/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(clientService, times(1)).deleteClient(1L);
    }

    @Test
    void deleteClient_WhenClientNotFound_ShouldReturnNotFound() throws Exception {
        doThrow(new ResourceNotFoundException("Cliente no encontrado")).when(clientService).deleteClient(999L);

        mockMvc.perform(delete("/clients/999")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        verify(clientService, times(1)).deleteClient(999L);
    }
}
