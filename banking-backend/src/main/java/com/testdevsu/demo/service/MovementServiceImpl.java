package com.testdevsu.demo.service;

import com.testdevsu.demo.dto.MovementRequestDTO;
import com.testdevsu.demo.dto.MovementResponseDTO;
import com.testdevsu.demo.exception.DailyLimitExceededException;
import com.testdevsu.demo.exception.InsufficientBalanceException;
import com.testdevsu.demo.exception.ResourceNotFoundException;
import com.testdevsu.demo.model.Account;
import com.testdevsu.demo.model.Movement;
import com.testdevsu.demo.repository.AccountRepository;
import com.testdevsu.demo.repository.MovementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MovementServiceImpl implements MovementService {

    private final MovementRepository movementRepository;
    private final AccountRepository accountRepository;
    
    private static final Double DAILY_WITHDRAWAL_LIMIT = 1000.0;

    @Transactional(readOnly = true)
    public List<MovementResponseDTO> getAllMovements() {
        return movementRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MovementResponseDTO getMovementById(Long id) {
        Movement movement = movementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movement not found with id: " + id));
        return mapToResponseDTO(movement);
    }

    @Transactional
    public MovementResponseDTO createMovement(MovementRequestDTO requestDTO) {
        // Validar que la cuenta exista
        Account account = accountRepository.findById(requestDTO.getAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + requestDTO.getAccountId()));

        // Obtener el saldo actual de la cuenta
        Double currentBalance = getCurrentBalance(account);

        // Validar valor del movimiento y ajustar según el tipo
        Double movementValue = requestDTO.getValue();
        

        if ("RETIRO".equalsIgnoreCase(requestDTO.getMovementType())) {
            movementValue = Math.abs(movementValue) * -1;
        } else if ("DEPOSITO".equalsIgnoreCase(requestDTO.getMovementType())) {
            movementValue = Math.abs(movementValue);
        }
        
        // Calcular nuevo saldo
        double newBalance = currentBalance + movementValue;
        
        // Validar que el saldo no sea negativo
        if (newBalance < 0) {
            throw new InsufficientBalanceException("Saldo no disponible");
        }
        
        // Validar límite diario solo para retiros (valores negativos)
        if (movementValue < 0) {
            validateDailyWithdrawalLimit(account, Math.abs(movementValue));
        }

        Movement movement = new Movement();
        movement.setDate(requestDTO.getDate() != null ? requestDTO.getDate() : LocalDateTime.now());
        movement.setMovementType(requestDTO.getMovementType());
        movement.setValue(movementValue);
        movement.setBalance(newBalance);
        movement.setAccount(account);

        Movement savedMovement = movementRepository.save(movement);
        return mapToResponseDTO(savedMovement);
    }

    @Transactional
    public MovementResponseDTO updateMovement(Long id, MovementRequestDTO requestDTO) {
        Movement movement = movementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movement not found with id: " + id));

        Account account = accountRepository.findById(requestDTO.getAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + requestDTO.getAccountId()));

        // Obtener saldo antes de este movimiento
        Double balanceBeforeThisMovement = getBalanceBeforeMovement(movement);
        
        // Validar valor del movimiento y ajustar según el tipo
        Double movementValue = requestDTO.getValue();

        if ("RETIRO".equalsIgnoreCase(requestDTO.getMovementType())) {
            movementValue = Math.abs(movementValue) * -1;
        } else if ("DEPOSITO".equalsIgnoreCase(requestDTO.getMovementType())) {
            movementValue = Math.abs(movementValue);
        }
        
        // Calcular nuevo saldo
        Double newBalance = balanceBeforeThisMovement + movementValue;
        
        // Validar que el saldo no sea negativo
        if (newBalance < 0) {
            throw new InsufficientBalanceException("Saldo no disponible");
        }

        movement.setDate(requestDTO.getDate());
        movement.setMovementType(requestDTO.getMovementType());
        movement.setValue(movementValue);
        movement.setBalance(newBalance);
        movement.setAccount(account);

        Movement updatedMovement = movementRepository.save(movement);
        return mapToResponseDTO(updatedMovement);
    }

    @Transactional
    public MovementResponseDTO partialUpdateMovement(Long id, MovementRequestDTO requestDTO) {
        Movement movement = movementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movement not found with id: " + id));

        if (requestDTO.getDate() != null) {
            movement.setDate(requestDTO.getDate());
        }
        
        // Si se actualiza el tipo o el valor, toca recalcular el balance
        boolean needsRecalculation = requestDTO.getMovementType() != null || requestDTO.getValue() != null;
        
        if (requestDTO.getMovementType() != null) {
            movement.setMovementType(requestDTO.getMovementType());
        }
        
        if (requestDTO.getValue() != null || needsRecalculation) {
            // Obtener el saldo antes de este movimiento
            Double balanceBeforeThisMovement = getBalanceBeforeMovement(movement);
            
            // Obtener el valor a usar
            Double movementValue = requestDTO.getValue() != null ? requestDTO.getValue() : movement.getValue();
            
            // Si es un retiro, asegurar que el valor sea negativo
            if ("RETIRO".equalsIgnoreCase(movement.getMovementType())) {
                movementValue = Math.abs(movementValue) * -1;
            } else if ("DEPOSITO".equalsIgnoreCase(movement.getMovementType())) {
                // Si es un depósito, asegurar que el valor sea positivo
                movementValue = Math.abs(movementValue);
            }
            
            // Calcular nuevo saldo
            Double newBalance = balanceBeforeThisMovement + movementValue;
            
            // Validar que el saldo no sea negativo
            if (newBalance < 0) {
                throw new InsufficientBalanceException("Saldo no disponible");
            }
            
            movement.setValue(movementValue);
            movement.setBalance(newBalance);
        }
        
        if (requestDTO.getAccountId() != null) {
            Account account = accountRepository.findById(requestDTO.getAccountId())
                    .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + requestDTO.getAccountId()));
            movement.setAccount(account);
        }

        Movement updatedMovement = movementRepository.save(movement);
        return mapToResponseDTO(updatedMovement);
    }

    @Transactional
    public void deleteMovement(Long id) {
        Movement movement = movementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movement not found with id: " + id));
        
        movementRepository.delete(movement);
    }

    private Double getCurrentBalance(Account account) {
        List<Movement> movements = movementRepository.findByAccountId(account.getId());
        
        return movements.stream()
                .reduce((first, second) -> second)
                .map(Movement::getBalance)
                .orElse(account.getInitialBalance());
    }

    private Double getBalanceBeforeMovement(Movement currentMovement) {
        // Obtener todos los movimientos de la cuenta ordenados por fecha
        List<Movement> movements = movementRepository.findByAccountId(currentMovement.getAccount().getId());

        // Encontrar el movimiento anterior a este
        Movement previousMovement = null;
        for (Movement mov : movements) {
            if (mov.getId().equals(currentMovement.getId())) {
                break;
            }
            previousMovement = mov;
        }

        // Si hay un movimiento anterior, retornar su balance, sino el saldo inicial
        return previousMovement != null ? 
                previousMovement.getBalance() : 
                currentMovement.getAccount().getInitialBalance();
    }

    private void validateDailyWithdrawalLimit(Account account, Double withdrawalAmount) {
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);
        
        // Obtener todos los retiros del día
        Double totalWithdrawalsToday = movementRepository
                .findByAccountIdAndDateBetween(account.getId(), startOfDay, endOfDay)
                .stream()
                .filter(movement -> movement.getValue() < 0)
                .map(Movement::getValue)
                .map(Math::abs)
                .reduce(0.0, Double::sum);
        
        double totalWithdrawal = totalWithdrawalsToday + withdrawalAmount;
        
        if (totalWithdrawal > DAILY_WITHDRAWAL_LIMIT) {
            throw new DailyLimitExceededException("Cupo diario Excedido");
        }
    }

    private MovementResponseDTO mapToResponseDTO(Movement movement) {
        return new MovementResponseDTO(
                movement.getId(),
                movement.getDate(),
                movement.getMovementType(),
                movement.getValue(),
                movement.getBalance(),
                movement.getAccount().getId(),
                movement.getAccount().getAccountNumber()
        );
    }
}
