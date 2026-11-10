package com.gymsphere.service;

import com.gymsphere.dto.TrainerDto;
import com.gymsphere.entity.Trainer;
import com.gymsphere.exception.BadRequestException;
import com.gymsphere.exception.ResourceNotFoundException;
import com.gymsphere.repository.TrainerRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TrainerService {

    private final TrainerRepository trainerRepository;

    public TrainerService(TrainerRepository trainerRepository) {
        this.trainerRepository = trainerRepository;
    }

    public Page<TrainerDto> searchTrainers(String query, String status, Pageable pageable) {
        return trainerRepository.searchTrainers(query, status, pageable)
                .map(this::toDto);
    }

    public List<TrainerDto> getAllActiveTrainers() {
        return trainerRepository.findAll().stream()
                .filter(t -> "ACTIVE".equalsIgnoreCase(t.getStatus()))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public TrainerDto getTrainerById(Long id) {
        Trainer trainer = trainerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trainer not found with id: " + id));
        return toDto(trainer);
    }

    @Transactional
    public TrainerDto createTrainer(TrainerDto dto) {
        String email = dto.getEmail() != null ? dto.getEmail().trim().toLowerCase() : "";
        if (trainerRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new BadRequestException("A trainer with email '" + dto.getEmail() + "' already exists.");
        }

        String fullName = dto.getFullName() != null ? dto.getFullName().trim() : "";
        String phone = (dto.getPhone() != null && !dto.getPhone().trim().isEmpty()) ? dto.getPhone().trim() : null;
        String specialization = (dto.getSpecialization() != null && !dto.getSpecialization().trim().isEmpty()) ? dto.getSpecialization().trim() : null;
        String status = (dto.getStatus() != null && !dto.getStatus().trim().isEmpty()) ? dto.getStatus().trim().toUpperCase() : "ACTIVE";

        Trainer trainer = new Trainer(
                fullName,
                email,
                phone,
                specialization,
                status
        );

        Trainer saved = trainerRepository.save(trainer);
        return toDto(saved);
    }

    @Transactional
    public TrainerDto updateTrainer(Long id, TrainerDto dto) {
        Trainer trainer = trainerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trainer not found with id: " + id));

        String email = dto.getEmail() != null ? dto.getEmail().trim().toLowerCase() : "";
        if (trainerRepository.existsByEmailIgnoreCaseAndTrainerIdNot(email, id)) {
            throw new BadRequestException("Another trainer is already using email '" + dto.getEmail() + "'.");
        }

        String fullName = dto.getFullName() != null ? dto.getFullName().trim() : "";
        String phone = (dto.getPhone() != null && !dto.getPhone().trim().isEmpty()) ? dto.getPhone().trim() : null;
        String specialization = (dto.getSpecialization() != null && !dto.getSpecialization().trim().isEmpty()) ? dto.getSpecialization().trim() : null;
        String status = (dto.getStatus() != null && !dto.getStatus().trim().isEmpty()) ? dto.getStatus().trim().toUpperCase() : "ACTIVE";

        trainer.setFullName(fullName);
        trainer.setEmail(email);
        trainer.setPhone(phone);
        trainer.setSpecialization(specialization);
        trainer.setStatus(status);

        Trainer updated = trainerRepository.save(trainer);
        return toDto(updated);
    }

    @Transactional
    public void deleteTrainer(Long id) {
        Trainer trainer = trainerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trainer not found with id: " + id));
        trainerRepository.delete(trainer);
    }

    @Transactional
    public void toggleTrainerStatus(Long id) {
        Trainer trainer = trainerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trainer not found with id: " + id));
        trainer.setStatus("ACTIVE".equalsIgnoreCase(trainer.getStatus()) ? "INACTIVE" : "ACTIVE");
        trainerRepository.save(trainer);
    }

    public TrainerDto toDto(Trainer entity) {
        TrainerDto dto = new TrainerDto();
        dto.setTrainerId(entity.getTrainerId());
        dto.setFullName(entity.getFullName());
        dto.setEmail(entity.getEmail());
        dto.setPhone(entity.getPhone());
        dto.setSpecialization(entity.getSpecialization());
        dto.setStatus(entity.getStatus());
        return dto;
    }
}
