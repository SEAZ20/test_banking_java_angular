package com.testdevsu.demo.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.testdevsu.demo.dto.AccountStatementDTO;
import com.testdevsu.demo.dto.ClientReportDTO;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class JsonReportFormatter implements ReportFormatter {

    @Override
    public String format(ClientReportDTO reportData) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            mapper.registerModule(new JavaTimeModule());
            mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

            List<AccountStatementDTO> statements = new ArrayList<>();
            
            reportData.getAccounts().forEach(account -> 
                account.getMovements().forEach(movement -> {
                    AccountStatementDTO statement = new AccountStatementDTO();
                    statement.setDate(movement.getDate().toString());
                    statement.setClient(reportData.getClientName());
                    statement.setAccountNumber(account.getAccountNumber());
                    statement.setType(account.getAccountType());
                    statement.setInitialBalance(account.getInitialBalance());
                    statement.setStatus(account.getStatus());
                    statement.setMovement(String.valueOf(movement.getValue()));
                    statement.setAvailableBalance(movement.getBalance());
                    statements.add(statement);
                })
            );
            
            return mapper.writerWithDefaultPrettyPrinter().writeValueAsString(statements);
        } catch (Exception e) {
            throw new RuntimeException("Error formatting JSON report", e);
        }
    }

    @Override
    public String getContentType() {
        return "application/json";
    }
}
