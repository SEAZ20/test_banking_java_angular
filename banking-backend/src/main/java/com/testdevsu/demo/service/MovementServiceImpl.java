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
                .orElseThrow(() -> new ResourceNotFoundException("Movimiento no encontrado con id: " + id));
        return mapToResponseDTO(movement);
    }

    @Transactional
    public MovementResponseDTO createMovement(MovementRequestDTO requestDTO) {
        Account account = accountRepository.findById(requestDTO.getAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Cuenta no encontrada con id: " + requestDTO.getAccountId()));

        Double currentBalance = getCurrentBalance(account);

        Double movementValue = requestDTO.getValue();
        

        if ("RETIRO".equalsIgnoreCase(requestDTO.getMovementType())) {
            movementValue = Math.abs(movementValue) * -1;
        } else if ("DEPOSITO".equalsIgnoreCase(requestDTO.getMovementType())) {
            movementValue = Math.abs(movementValue);
        }

        double newBalance = currentBalance + movementValue;

        if (newBalance < 0) {
            throw new InsufficientBalanceException("Saldo no disponible");
        }

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
                .orElseThrow(() -> new ResourceNotFoundException("Movimiento no encontrado con id: " + id));

        Account account = accountRepository.findById(requestDTO.getAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Cuenta no encontrada con id: " + requestDTO.getAccountId()));

        Double balanceBeforeThisMovement = getBalanceBeforeMovement(movement);

        Double movementValue = requestDTO.getValue();

        if ("RETIRO".equalsIgnoreCase(requestDTO.getMovementType())) {
            movementValue = Math.abs(movementValue) * -1;
        } else if ("DEPOSITO".equalsIgnoreCase(requestDTO.getMovementType())) {
            movementValue = Math.abs(movementValue);
        }

        double newBalance = balanceBeforeThisMovement + movementValue;

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
                .orElseThrow(() -> new ResourceNotFoundException("Movimiento no encontrado con id: " + id));

        if (requestDTO.getDate() != null) {
            movement.setDate(requestDTO.getDate());
        }

        boolean needsRecalculation = requestDTO.getMovementType() != null || requestDTO.getValue() != null;
        
        if (requestDTO.getMovementType() != null) {
            movement.setMovementType(requestDTO.getMovementType());
        }
        
        if (requestDTO.getValue() != null || needsRecalculation) {
            Double balanceBeforeThisMovement = getBalanceBeforeMovement(movement);

            Double movementValue = requestDTO.getValue() != null ? requestDTO.getValue() : movement.getValue();

            if ("RETIRO".equalsIgnoreCase(movement.getMovementType())) {
                movementValue = Math.abs(movementValue) * -1;
            } else if ("DEPOSITO".equalsIgnoreCase(movement.getMovementType())) {
                movementValue = Math.abs(movementValue);
            }

            double newBalance = balanceBeforeThisMovement + movementValue;

            if (newBalance < 0) {
                throw new InsufficientBalanceException("Saldo no disponible");
            }
            
            movement.setValue(movementValue);
            movement.setBalance(newBalance);
        }
        
        if (requestDTO.getAccountId() != null) {
            Account account = accountRepository.findById(requestDTO.getAccountId())
                    .orElseThrow(() -> new ResourceNotFoundException("Cuenta no encontrada con id: " + requestDTO.getAccountId()));
            movement.setAccount(account);
        }

        Movement updatedMovement = movementRepository.save(movement);
        return mapToResponseDTO(updatedMovement);
    }

    @Transactional
    public void deleteMovement(Long id) {
        Movement movement = movementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movimiento no encontrado con id: " + id));
        
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
        List<Movement> movements = movementRepository.findByAccountId(currentMovement.getAccount().getId());

        Movement previousMovement = null;
        for (Movement mov : movements) {
            if (mov.getId().equals(currentMovement.getId())) {
                break;
            }
            previousMovement = mov;
        }

        return previousMovement != null ? 
                previousMovement.getBalance() : 
                currentMovement.getAccount().getInitialBalance();
    }

    private void validateDailyWithdrawalLimit(Account account, Double withdrawalAmount) {
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);

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
