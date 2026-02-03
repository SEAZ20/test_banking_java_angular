package com.testdevsu.demo.service;

import com.testdevsu.demo.dto.AccountRequestDTO;
import com.testdevsu.demo.dto.AccountResponseDTO;
import java.util.List;

public interface AccountService {
    List<AccountResponseDTO> getAllAccounts();
    AccountResponseDTO getAccountById(Long id);
    AccountResponseDTO createAccount(AccountRequestDTO requestDTO);
    AccountResponseDTO updateAccount(Long id, AccountRequestDTO requestDTO);
    AccountResponseDTO partialUpdateAccount(Long id, AccountRequestDTO requestDTO);
    void deleteAccount(Long id);
}
