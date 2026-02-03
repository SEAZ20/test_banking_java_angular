package com.testdevsu.demo.service;

import com.testdevsu.demo.dto.MovementRequestDTO;
import com.testdevsu.demo.dto.MovementResponseDTO;
import java.util.List;

public interface MovementService {
    List<MovementResponseDTO> getAllMovements();
    MovementResponseDTO getMovementById(Long id);
    MovementResponseDTO createMovement(MovementRequestDTO requestDTO);
    MovementResponseDTO updateMovement(Long id, MovementRequestDTO requestDTO);
    MovementResponseDTO partialUpdateMovement(Long id, MovementRequestDTO requestDTO);
    void deleteMovement(Long id);
}
