package com.testdevsu.demo.service;

import com.testdevsu.demo.dto.ClientRequestDTO;
import com.testdevsu.demo.dto.ClientResponseDTO;
import java.util.List;

public interface ClientService {
    List<ClientResponseDTO> getAllClients();
    ClientResponseDTO getClientById(Long id);
    ClientResponseDTO createClient(ClientRequestDTO requestDTO);
    ClientResponseDTO updateClient(Long id, ClientRequestDTO requestDTO);
    ClientResponseDTO partialUpdateClient(Long id, ClientRequestDTO requestDTO);
    void deleteClient(Long id);
}
