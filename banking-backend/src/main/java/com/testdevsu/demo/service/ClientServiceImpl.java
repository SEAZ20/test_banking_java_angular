package com.testdevsu.demo.service;

import com.testdevsu.demo.dto.ClientRequestDTO;
import com.testdevsu.demo.dto.ClientResponseDTO;
import com.testdevsu.demo.exception.DuplicateResourceException;
import com.testdevsu.demo.exception.ResourceNotFoundException;
import com.testdevsu.demo.model.Client;
import com.testdevsu.demo.repository.ClientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClientServiceImpl implements ClientService {

    private final ClientRepository clientRepository;

    @Transactional(readOnly = true)
    public List<ClientResponseDTO> getAllClients() {
        return clientRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ClientResponseDTO getClientById(Long id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con id: " + id));
        return mapToResponseDTO(client);
    }

    @Transactional
    public ClientResponseDTO createClient(ClientRequestDTO requestDTO) {
        if (requestDTO.getPassword() == null || requestDTO.getPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("La contraseña es requerida");
        }

        if (requestDTO.getPassword().length() < 4 || requestDTO.getPassword().length() > 255) {
            throw new IllegalArgumentException("La contraseña debe tener entre 4 y 255 caracteres");
        }

        // Validar que no exista clientId duplicado
        if (clientRepository.findByClientId(requestDTO.getClientId()).isPresent()) {
            throw new DuplicateResourceException("El cliente ya existe con clientId: " + requestDTO.getClientId());
        }
        
        // Validar que no exista identificación duplicada
        if (clientRepository.findByIdentification(requestDTO.getIdentification()).isPresent()) {
            throw new DuplicateResourceException("El cliente ya existe con identificación: " + requestDTO.getIdentification());
        }

        Client client = new Client();
        client.setName(requestDTO.getName());
        client.setGender(requestDTO.getGender());
        client.setAge(requestDTO.getAge());
        client.setIdentification(requestDTO.getIdentification());
        client.setAddress(requestDTO.getAddress());
        client.setPhone(requestDTO.getPhone());
        client.setClientId(requestDTO.getClientId());
        client.setPassword(requestDTO.getPassword());
        client.setStatus(requestDTO.getStatus() != null ? requestDTO.getStatus() : true);

        Client savedClient = clientRepository.save(client);
        return mapToResponseDTO(savedClient);
    }

    @Transactional
    public ClientResponseDTO updateClient(Long id, ClientRequestDTO requestDTO) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con id: " + id));

        client.setName(requestDTO.getName());
        client.setGender(requestDTO.getGender());
        client.setAge(requestDTO.getAge());
        client.setIdentification(requestDTO.getIdentification());
        client.setAddress(requestDTO.getAddress());
        client.setPhone(requestDTO.getPhone());
        client.setClientId(requestDTO.getClientId());
        if (requestDTO.getPassword() != null && !requestDTO.getPassword().trim().isEmpty()) {
            if (requestDTO.getPassword().length() < 4 || requestDTO.getPassword().length() > 255) {
                throw new IllegalArgumentException("La contraseña debe tener entre 4 y 255 caracteres");
            }
            client.setPassword(requestDTO.getPassword());
        }
        client.setStatus(requestDTO.getStatus());

        Client updatedClient = clientRepository.save(client);
        return mapToResponseDTO(updatedClient);
    }

    @Transactional
    public ClientResponseDTO partialUpdateClient(Long id, ClientRequestDTO requestDTO) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con id: " + id));

        if (requestDTO.getName() != null) client.setName(requestDTO.getName());
        if (requestDTO.getGender() != null) client.setGender(requestDTO.getGender());
        if (requestDTO.getAge() != null) client.setAge(requestDTO.getAge());
        if (requestDTO.getIdentification() != null) client.setIdentification(requestDTO.getIdentification());
        if (requestDTO.getAddress() != null) client.setAddress(requestDTO.getAddress());
        if (requestDTO.getPhone() != null) client.setPhone(requestDTO.getPhone());
        if (requestDTO.getClientId() != null) client.setClientId(requestDTO.getClientId());
        if (requestDTO.getPassword() != null && !requestDTO.getPassword().trim().isEmpty()) {
            if (requestDTO.getPassword().length() < 4 || requestDTO.getPassword().length() > 255) {
                throw new IllegalArgumentException("La contraseña debe tener entre 4 y 255 caracteres");
            }
            client.setPassword(requestDTO.getPassword());
        }
        if (requestDTO.getStatus() != null) client.setStatus(requestDTO.getStatus());

        Client updatedClient = clientRepository.save(client);
        return mapToResponseDTO(updatedClient);
    }

    @Transactional
    public void deleteClient(Long id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con id: " + id));

        client.setStatus(false);
        clientRepository.save(client);
    }

    private ClientResponseDTO mapToResponseDTO(Client client) {
        return new ClientResponseDTO(
                client.getId(),
                client.getName(),
                client.getGender(),
                client.getAge(),
                client.getIdentification(),
                client.getAddress(),
                client.getPhone(),
                client.getClientId(),
                client.getStatus()
        );
    }
}
