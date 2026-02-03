package com.testdevsu.demo.controller;

import com.testdevsu.demo.exception.ResourceNotFoundException;
import com.testdevsu.demo.service.ReportService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ReportController.class)
class ReportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ReportService reportService;

    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String jsonReport;
    private String pdfReport;

    @BeforeEach
    void setUp() {
        startDate = LocalDateTime.of(2024, 2, 1, 0, 0, 0);
        endDate = LocalDateTime.of(2024, 2, 29, 23, 59, 59);
        
       jsonReport = """
       [ {
         "fecha" : "2026-01-31T21:31",
         "cliente" : "Silvio Alcivar",
         "numeroCuenta" : "225487",
         "tipo" : "Corriente",
         "saldoInicial" : 2000.0,
         "estado" : true,
         "movimiento" : "-300.0",
         "saldoDisponible" : 2000.0
       } ]
       """;
        
        pdfReport = "Estado de Cuenta - Jose Lema\\nFecha: 01/02/2024 - 29/02/2024\\n...";
    }

    @Test
    void getAccountStatement_WithJsonFormat_ShouldReturnJsonReport() throws Exception {
        when(reportService.generateAccountStatement(eq(1L), any(LocalDateTime.class), any(LocalDateTime.class), eq("json")))
                .thenReturn(jsonReport);

        mockMvc.perform(get("/reportes")
                        .param("clientId", "1")
                        .param("startDate", startDate.format(DateTimeFormatter.ISO_DATE_TIME))
                        .param("endDate", endDate.format(DateTimeFormatter.ISO_DATE_TIME))
                        .param("format", "json"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/json"))
                .andExpect(content().string(jsonReport));

        verify(reportService, times(1)).generateAccountStatement(eq(1L), any(LocalDateTime.class), any(LocalDateTime.class), eq("json"));
    }

    @Test
    void getAccountStatement_WithPdfFormat_ShouldReturnPdfReport() throws Exception {
        when(reportService.generateAccountStatement(eq(1L), any(LocalDateTime.class), any(LocalDateTime.class), eq("pdf")))
                .thenReturn(pdfReport);

        mockMvc.perform(get("/reportes")
                        .param("clientId", "1")
                        .param("startDate", startDate.format(DateTimeFormatter.ISO_DATE_TIME))
                        .param("endDate", endDate.format(DateTimeFormatter.ISO_DATE_TIME))
                        .param("format", "pdf"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "text/plain"))
                .andExpect(content().string(pdfReport));

        verify(reportService, times(1)).generateAccountStatement(eq(1L), any(LocalDateTime.class), any(LocalDateTime.class), eq("pdf"));
    }

    @Test
    void getAccountStatement_WithDefaultFormat_ShouldReturnJsonReport() throws Exception {
        when(reportService.generateAccountStatement(eq(1L), any(LocalDateTime.class), any(LocalDateTime.class), eq("json")))
                .thenReturn(jsonReport);

        // No se proporciona el parámetro format, debe usar 'json' por defecto
        mockMvc.perform(get("/reportes")
                        .param("clientId", "1")
                        .param("startDate", startDate.format(DateTimeFormatter.ISO_DATE_TIME))
                        .param("endDate", endDate.format(DateTimeFormatter.ISO_DATE_TIME)))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/json"))
                .andExpect(content().string(jsonReport));

        verify(reportService, times(1)).generateAccountStatement(eq(1L), any(LocalDateTime.class), any(LocalDateTime.class), eq("json"));
    }

    @Test
    void getAccountStatement_WhenClientNotFound_ShouldReturnNotFound() throws Exception {
        when(reportService.generateAccountStatement(eq(999L), any(LocalDateTime.class), any(LocalDateTime.class), eq("json")))
                .thenThrow(new ResourceNotFoundException("Cliente no encontrado"));

        mockMvc.perform(get("/reportes")
                        .param("clientId", "999")
                        .param("startDate", startDate.format(DateTimeFormatter.ISO_DATE_TIME))
                        .param("endDate", endDate.format(DateTimeFormatter.ISO_DATE_TIME))
                        .param("format", "json"))
                .andExpect(status().isNotFound());

        verify(reportService, times(1)).generateAccountStatement(eq(999L), any(LocalDateTime.class), any(LocalDateTime.class), eq("json"));
    }

    @Test
    void getAccountStatement_WithSameDateRange_ShouldReturnReport() throws Exception {
        // Consulta para un solo día
        LocalDateTime sameDate = LocalDateTime.of(2024, 2, 10, 0, 0, 0);
        when(reportService.generateAccountStatement(eq(1L), any(LocalDateTime.class), any(LocalDateTime.class), eq("json")))
                .thenReturn(jsonReport);

        mockMvc.perform(get("/reportes")
                        .param("clientId", "1")
                        .param("startDate", sameDate.format(DateTimeFormatter.ISO_DATE_TIME))
                        .param("endDate", sameDate.format(DateTimeFormatter.ISO_DATE_TIME))
                        .param("format", "json"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/json"));

        verify(reportService, times(1)).generateAccountStatement(eq(1L), any(LocalDateTime.class), any(LocalDateTime.class), eq("json"));
    }

    @Test
    void getAccountStatement_WithEmptyReport_ShouldReturnOk() throws Exception {
        // Cliente sin movimientos en el período
        String emptyReport = "{\"client\": \"Jose Lema\", \"accounts\": []}";
        when(reportService.generateAccountStatement(eq(3L), any(LocalDateTime.class), any(LocalDateTime.class), eq("json")))
                .thenReturn(emptyReport);

        mockMvc.perform(get("/reportes")
                        .param("clientId", "3")
                        .param("startDate", startDate.format(DateTimeFormatter.ISO_DATE_TIME))
                        .param("endDate", endDate.format(DateTimeFormatter.ISO_DATE_TIME))
                        .param("format", "json"))
                .andExpect(status().isOk())
                .andExpect(content().string(emptyReport));

        verify(reportService, times(1)).generateAccountStatement(eq(3L), any(LocalDateTime.class), any(LocalDateTime.class), eq("json"));
    }

    @Test
    void getAccountStatement_WithDifferentDateRange_ShouldReturnReport() throws Exception {
        LocalDateTime customStart = LocalDateTime.of(2024, 2, 10, 0, 0, 0);
        LocalDateTime customEnd = LocalDateTime.of(2024, 2, 15, 23, 59, 59);
        
        when(reportService.generateAccountStatement(eq(2L), any(LocalDateTime.class), any(LocalDateTime.class), eq("json")))
                .thenReturn(jsonReport);

        mockMvc.perform(get("/reportes")
                        .param("clientId", "2")
                        .param("startDate", customStart.format(DateTimeFormatter.ISO_DATE_TIME))
                        .param("endDate", customEnd.format(DateTimeFormatter.ISO_DATE_TIME))
                        .param("format", "json"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/json"));

        verify(reportService, times(1)).generateAccountStatement(eq(2L), any(LocalDateTime.class), any(LocalDateTime.class), eq("json"));
    }

    @Test
    void getAccountStatement_WithMultipleClients_ShouldGenerateIndependentReports() throws Exception {
        String client1Report = "{\"client\": \"Jose Lema\"}";
        String client2Report = "{\"client\": \"Marianela Montalvo\"}";
        
        when(reportService.generateAccountStatement(eq(1L), any(LocalDateTime.class), any(LocalDateTime.class), eq("json")))
                .thenReturn(client1Report);
        when(reportService.generateAccountStatement(eq(2L), any(LocalDateTime.class), any(LocalDateTime.class), eq("json")))
                .thenReturn(client2Report);

        mockMvc.perform(get("/reportes")
                        .param("clientId", "1")
                        .param("startDate", startDate.format(DateTimeFormatter.ISO_DATE_TIME))
                        .param("endDate", endDate.format(DateTimeFormatter.ISO_DATE_TIME))
                        .param("format", "json"))
                .andExpect(status().isOk())
                .andExpect(content().string(client1Report));

        mockMvc.perform(get("/reportes")
                        .param("clientId", "2")
                        .param("startDate", startDate.format(DateTimeFormatter.ISO_DATE_TIME))
                        .param("endDate", endDate.format(DateTimeFormatter.ISO_DATE_TIME))
                        .param("format", "json"))
                .andExpect(status().isOk())
                .andExpect(content().string(client2Report));

        verify(reportService, times(1)).generateAccountStatement(eq(1L), any(LocalDateTime.class), any(LocalDateTime.class), eq("json"));
        verify(reportService, times(1)).generateAccountStatement(eq(2L), any(LocalDateTime.class), any(LocalDateTime.class), eq("json"));
    }
}
