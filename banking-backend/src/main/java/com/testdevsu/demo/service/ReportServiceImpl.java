package com.testdevsu.demo.service;

import com.testdevsu.demo.config.ReportFormatter;
import com.testdevsu.demo.dto.AccountReportDTO;
import com.testdevsu.demo.dto.ClientReportDTO;
import com.testdevsu.demo.dto.MovementReportDTO;
import com.testdevsu.demo.exception.ResourceNotFoundException;
import com.testdevsu.demo.model.Account;
import com.testdevsu.demo.model.Client;
import com.testdevsu.demo.model.Movement;
import com.testdevsu.demo.repository.AccountRepository;
import com.testdevsu.demo.repository.ClientRepository;
import com.testdevsu.demo.repository.MovementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final ClientRepository clientRepository;
    private final AccountRepository accountRepository;
    private final MovementRepository movementRepository;
    private final Map<String, ReportFormatter> formatters;

    @Transactional(readOnly = true)
    public String generateAccountStatement(Long clientId, LocalDateTime startDate, 
                                          LocalDateTime endDate, String format) {

        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con id: " + clientId));

        List<Account> accounts = accountRepository.findByClientId(clientId);

        if (accounts.isEmpty()) {
            throw new ResourceNotFoundException("No se encontraron cuentas para el cliente: " + client.getName());
        }

        List<AccountReportDTO> accountReports = accounts.stream()
                .map(account -> buildAccountReport(account, startDate, endDate))
                .collect(Collectors.toList());

        ClientReportDTO reportData = new ClientReportDTO(
                client.getName(),
                client.getClientId(),
                startDate.format(DateTimeFormatter.ISO_LOCAL_DATE),
                endDate.format(DateTimeFormatter.ISO_LOCAL_DATE),
                accountReports
        );

        ReportFormatter formatter = getFormatter(format);
        return formatter.format(reportData);
    }

    private AccountReportDTO buildAccountReport(Account account, LocalDateTime startDate, LocalDateTime endDate) {
        List<Movement> movements = movementRepository
                .findByAccountIdAndDateBetween(account.getId(), startDate, endDate);

        List<MovementReportDTO> movementReports = movements.stream()
                .map(m -> new MovementReportDTO(
                        m.getDate(),
                        m.getMovementType(),
                        m.getValue(),
                        m.getBalance()
                ))
                .collect(Collectors.toList());

        // Calcular totales
        Double totalCredits = movements.stream()
                .filter(m -> m.getValue() > 0)
                .map(Movement::getValue)
                .reduce(0.0, Double::sum);

        Double totalDebits = movements.stream()
                .filter(m -> m.getValue() < 0)
                .map(Movement::getValue)
                .map(Math::abs)
                .reduce(0.0, Double::sum);

        // Obtener saldo disponible
        Double availableBalance = movements.stream()
                .reduce((first, second) -> second)
                .map(Movement::getBalance)
                .orElse(account.getInitialBalance());

        return new AccountReportDTO(
                account.getAccountNumber(),
                account.getAccountType(),
                account.getInitialBalance(),
                account.getStatus(),
                totalCredits,
                totalDebits,
                availableBalance,
                movementReports
        );
    }

    private ReportFormatter getFormatter(String format) {
        String formatterKey = format.toLowerCase() + "ReportFormatter";
        ReportFormatter formatter = formatters.get(formatterKey);
        
        if (formatter == null) {
            throw new IllegalArgumentException("Formato de reporte no soportado: " + format);
        }
        
        return formatter;
    }
}
