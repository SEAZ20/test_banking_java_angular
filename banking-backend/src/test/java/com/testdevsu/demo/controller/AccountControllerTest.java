package com.testdevsu.demo.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.testdevsu.demo.dto.AccountRequestDTO;
import com.testdevsu.demo.dto.AccountResponseDTO;
import com.testdevsu.demo.exception.ResourceNotFoundException;
import com.testdevsu.demo.service.AccountService;
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

@WebMvcTest(AccountController.class)
class AccountControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AccountService accountService;

    @Autowired
    private ObjectMapper objectMapper;

    private AccountResponseDTO accountResponse;
    private AccountRequestDTO accountRequest;

    @BeforeEach
    void setUp() {
        accountResponse = new AccountResponseDTO(
                1L,
                "478758",
                "Ahorros",
                2000.0,
                2000.0,
                true,
                1L,
                "Jose Lema"
        );

        accountRequest = new AccountRequestDTO(
                "478758",
                "Ahorros",
                2000.0,
                true,
                1L
        );
    }

    @Test
    void getAllAccounts_ShouldReturnListOfAccounts() throws Exception {
        AccountResponseDTO account2 = new AccountResponseDTO(
                2L,
                "225487",
                "Corriente",
                100.0,
                100.0,
                true,
                2L,
                "Marianela Montalvo"
        );
        List<AccountResponseDTO> accounts = Arrays.asList(accountResponse, account2);
        when(accountService.getAllAccounts()).thenReturn(accounts);

        mockMvc.perform(get("/accounts")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].id", is(1)))
                .andExpect(jsonPath("$[0].accountNumber", is("478758")))
                .andExpect(jsonPath("$[0].accountType", is("Ahorros")))
                .andExpect(jsonPath("$[0].currentBalance", is(2000.0)))
                .andExpect(jsonPath("$[1].id", is(2)))
                .andExpect(jsonPath("$[1].accountNumber", is("225487")));

        verify(accountService, times(1)).getAllAccounts();
    }

    @Test
    void getAccountById_WhenAccountExists_ShouldReturnAccount() throws Exception {
        when(accountService.getAccountById(1L)).thenReturn(accountResponse);

        mockMvc.perform(get("/accounts/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.accountNumber", is("478758")))
                .andExpect(jsonPath("$.accountType", is("Ahorros")))
                .andExpect(jsonPath("$.initialBalance", is(2000.0)))
                .andExpect(jsonPath("$.currentBalance", is(2000.0)))
                .andExpect(jsonPath("$.status", is(true)))
                .andExpect(jsonPath("$.clientId", is(1)))
                .andExpect(jsonPath("$.clientName", is("Jose Lema")));

        verify(accountService, times(1)).getAccountById(1L);
    }

    @Test
    void getAccountById_WhenAccountNotFound_ShouldReturnNotFound() throws Exception {
        when(accountService.getAccountById(999L)).thenThrow(new ResourceNotFoundException("Cuenta no encontrada"));

        mockMvc.perform(get("/accounts/999")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        verify(accountService, times(1)).getAccountById(999L);
    }

    @Test
    void createAccount_WithValidData_ShouldReturnCreatedAccount() throws Exception {
        when(accountService.createAccount(any(AccountRequestDTO.class))).thenReturn(accountResponse);

        mockMvc.perform(post("/accounts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(accountRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.accountNumber", is("478758")))
                .andExpect(jsonPath("$.accountType", is("Ahorros")))
                .andExpect(jsonPath("$.currentBalance", is(2000.0)));

        verify(accountService, times(1)).createAccount(any(AccountRequestDTO.class));
    }

    @Test
    void createAccount_WithInvalidData_ShouldReturnBadRequest() throws Exception {
        AccountRequestDTO invalidRequest = new AccountRequestDTO();
        invalidRequest.setAccountNumber(""); // Número de cuenta vacío - violación de validación
        invalidRequest.setClientId(null); // Cliente ID nulo - violación de validación

        mockMvc.perform(post("/accounts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());

        verify(accountService, never()).createAccount(any(AccountRequestDTO.class));
    }

    @Test
    void updateAccount_WhenAccountExists_ShouldReturnUpdatedAccount() throws Exception {
        AccountResponseDTO updatedResponse = new AccountResponseDTO(
                1L,
                "478758",
                "Corriente",
                3000.0,
                3000.0,
                true,
                1L,
                "Jose Lema"
        );
        when(accountService.updateAccount(eq(1L), any(AccountRequestDTO.class))).thenReturn(updatedResponse);

        AccountRequestDTO updateRequest = new AccountRequestDTO(
                "478758",
                "Corriente",
                3000.0,
                true,
                1L
        );

        mockMvc.perform(put("/accounts/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.accountType", is("Corriente")))
                .andExpect(jsonPath("$.initialBalance", is(3000.0)));

        verify(accountService, times(1)).updateAccount(eq(1L), any(AccountRequestDTO.class));
    }

    @Test
    void partialUpdateAccount_ShouldReturnPartiallyUpdatedAccount() throws Exception {
        AccountResponseDTO updatedResponse = new AccountResponseDTO(
                1L,
                "478758",
                "Ahorros",
                2000.0,
                2000.0,
                false, // Estado actualizado
                1L,
                "Jose Lema"
        );
        when(accountService.partialUpdateAccount(eq(1L), any(AccountRequestDTO.class))).thenReturn(updatedResponse);

        AccountRequestDTO partialRequest = new AccountRequestDTO();
        partialRequest.setStatus(false);

        mockMvc.perform(patch("/accounts/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(partialRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.status", is(false)));

        verify(accountService, times(1)).partialUpdateAccount(eq(1L), any(AccountRequestDTO.class));
    }

    @Test
    void deleteAccount_WhenAccountExists_ShouldReturnNoContent() throws Exception {
        doNothing().when(accountService).deleteAccount(1L);

        mockMvc.perform(delete("/accounts/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(accountService, times(1)).deleteAccount(1L);
    }

    @Test
    void deleteAccount_WhenAccountNotFound_ShouldReturnNotFound() throws Exception {
        doThrow(new ResourceNotFoundException("Cuenta no encontrada")).when(accountService).deleteAccount(999L);

        mockMvc.perform(delete("/accounts/999")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        verify(accountService, times(1)).deleteAccount(999L);
    }
}
