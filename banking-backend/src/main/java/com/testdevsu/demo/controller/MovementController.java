package com.testdevsu.demo.controller;

import com.testdevsu.demo.dto.MovementRequestDTO;
import com.testdevsu.demo.dto.MovementResponseDTO;
import com.testdevsu.demo.service.MovementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/movements")
@RequiredArgsConstructor
public class MovementController {

    private final MovementService movementService;

    @GetMapping
    public ResponseEntity<List<MovementResponseDTO>> getAllMovements() {
        List<MovementResponseDTO> movements = movementService.getAllMovements();
        return ResponseEntity.ok(movements);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MovementResponseDTO> getMovementById(@PathVariable Long id) {
        MovementResponseDTO movement = movementService.getMovementById(id);
        return ResponseEntity.ok(movement);
    }

    @PostMapping
    public ResponseEntity<MovementResponseDTO> createMovement(@Valid @RequestBody MovementRequestDTO requestDTO) {
        MovementResponseDTO movement = movementService.createMovement(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(movement);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MovementResponseDTO> updateMovement(
            @PathVariable Long id, 
            @Valid @RequestBody MovementRequestDTO requestDTO) {
        MovementResponseDTO movement = movementService.updateMovement(id, requestDTO);
        return ResponseEntity.ok(movement);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<MovementResponseDTO> partialUpdateMovement(
            @PathVariable Long id, 
            @RequestBody MovementRequestDTO requestDTO) {
        MovementResponseDTO movement = movementService.partialUpdateMovement(id, requestDTO);
        return ResponseEntity.ok(movement);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMovement(@PathVariable Long id) {
        movementService.deleteMovement(id);
        return ResponseEntity.noContent().build();
    }
}
