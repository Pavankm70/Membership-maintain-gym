package com.gymsphere.controller;

import com.gymsphere.dto.TrainerDto;
import com.gymsphere.service.TrainerService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trainers")
public class TrainerController {

    private final TrainerService trainerService;

    public TrainerController(TrainerService trainerService) {
        this.trainerService = trainerService;
    }

    @GetMapping
    public ResponseEntity<Page<TrainerDto>> getAllTrainers(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "trainerId") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = "desc".equalsIgnoreCase(direction) ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        PageRequest pageRequest = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(trainerService.searchTrainers(query, status, pageRequest));
    }

    @GetMapping("/active")
    public ResponseEntity<List<TrainerDto>> getAllActiveTrainers() {
        return ResponseEntity.ok(trainerService.getAllActiveTrainers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrainerDto> getTrainerById(@PathVariable Long id) {
        return ResponseEntity.ok(trainerService.getTrainerById(id));
    }

    @PostMapping
    public ResponseEntity<TrainerDto> createTrainer(@Valid @RequestBody TrainerDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(trainerService.createTrainer(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TrainerDto> updateTrainer(@PathVariable Long id, @Valid @RequestBody TrainerDto dto) {
        return ResponseEntity.ok(trainerService.updateTrainer(id, dto));
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<Void> toggleStatus(@PathVariable Long id) {
        trainerService.toggleTrainerStatus(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrainer(@PathVariable Long id) {
        trainerService.deleteTrainer(id);
        return ResponseEntity.noContent().build();
    }
}
