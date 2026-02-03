package com.testdevsu.demo.service;

import com.testdevsu.demo.dto.AccountRequestDTO;
import com.testdevsu.demo.dto.AccountResponseDTO;
import com.testdevsu.demo.exception.DuplicateResourceException;
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
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final ClientRepository clientRepository;
    private final MovementRepository movementRepository;

    @Transactional(readOnly = true)
    public List<AccountResponseDTO> getAllAccounts() {
        return accountRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AccountResponseDTO getAccountById(Long id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cuenta no encontrada con id: " + id));
        return mapToResponseDTO(account);
    }

    @Transactional
    public AccountResponseDTO createAccount(AccountRequestDTO requestDTO) {

        if (accountRepository.findByAccountNumber(requestDTO.getAccountNumber()).isPresent()) {
            throw new DuplicateResourceException("La cuenta ya existe con el número: " + requestDTO.getAccountNumber());
        }

        Client client = clientRepository.findById(requestDTO.getClientId())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con id: " + requestDTO.getClientId()));

        Account account = new Account();
        account.setAccountNumber(requestDTO.getAccountNumber());
        account.setAccountType(requestDTO.getAccountType());
        account.setInitialBalance(requestDTO.getInitialBalance());
        account.setStatus(requestDTO.getStatus() != null ? requestDTO.getStatus() : true);
        account.setClient(client);

        Account savedAccount = accountRepository.save(account);
        return mapToResponseDTO(savedAccount);
    }

    @Transactional
    public AccountResponseDTO updateAccount(Long id, AccountRequestDTO requestDTO) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cuenta no encontrada con id: " + id));

        Client client = clientRepository.findById(requestDTO.getClientId())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con id: " + requestDTO.getClientId()));

        account.setAccountNumber(requestDTO.getAccountNumber());
        account.setAccountType(requestDTO.getAccountType());
        account.setInitialBalance(requestDTO.getInitialBalance());
        account.setStatus(requestDTO.getStatus());
        account.setClient(client);

        Account updatedAccount = accountRepository.save(account);
        return mapToResponseDTO(updatedAccount);
    }

    @Transactional
    public AccountResponseDTO partialUpdateAccount(Long id, AccountRequestDTO requestDTO) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cuenta no encontrada con id: " + id));

        if (requestDTO.getAccountNumber() != null) account.setAccountNumber(requestDTO.getAccountNumber());
        if (requestDTO.getAccountType() != null) account.setAccountType(requestDTO.getAccountType());
        if (requestDTO.getInitialBalance() != null) account.setInitialBalance(requestDTO.getInitialBalance());
        if (requestDTO.getStatus() != null) account.setStatus(requestDTO.getStatus());
        
        if (requestDTO.getClientId() != null) {
            Client client = clientRepository.findById(requestDTO.getClientId())
                    .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con id: " + requestDTO.getClientId()));
            account.setClient(client);
        }

        Account updatedAccount = accountRepository.save(account);
        return mapToResponseDTO(updatedAccount);
    }

    @Transactional
    public void deleteAccount(Long id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cuenta no encontrada con id: " + id));
        account.setStatus(false);
        accountRepository.save(account);
    }

    private AccountResponseDTO mapToResponseDTO(Account account) {
        Double currentBalance = getCurrentBalance(account);
        return new AccountResponseDTO(
                account.getId(),
                account.getAccountNumber(),
                account.getAccountType(),
                account.getInitialBalance(),
                currentBalance,
                account.getStatus(),
                account.getClient().getId(),
                account.getClient().getName()
        );
    }
    
    private Double getCurrentBalance(Account account) {
        List<Movement> movements = movementRepository.findByAccountId(account.getId());
        
        return movements.stream()
                .reduce((first, second) -> second)
                .map(Movement::getBalance)
                .orElse(account.getInitialBalance());
    }
}
