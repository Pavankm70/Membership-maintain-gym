package com.gymsphere.service;

import com.gymsphere.dto.PlanDto;
import com.gymsphere.entity.MembershipPlan;
import com.gymsphere.exception.BadRequestException;
import com.gymsphere.exception.ResourceNotFoundException;
import com.gymsphere.repository.MembershipPlanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MembershipPlanService {

    private final MembershipPlanRepository planRepository;

    public MembershipPlanService(MembershipPlanRepository planRepository) {
        this.planRepository = planRepository;
    }

    public List<PlanDto> getAllPlans() {
        return planRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public PlanDto getPlanById(Long id) {
        MembershipPlan plan = planRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found with id: " + id));
        return toDto(plan);
    }

    @Transactional
    public PlanDto createPlan(PlanDto dto) {
        if (planRepository.findByPlanName(dto.getPlanName().trim()).isPresent()) {
            throw new BadRequestException("A plan with name '" + dto.getPlanName() + "' already exists.");
        }
        if (dto.getDurationMonths() <= 0) {
            throw new BadRequestException("Plan duration must be at least 1 month.");
        }
        if (dto.getPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Plan price cannot be negative.");
        }

        MembershipPlan plan = new MembershipPlan(
                dto.getPlanName().trim(),
                dto.getDurationMonths(),
                dto.getPrice(),
                dto.getDescription() != null ? dto.getDescription().trim() : null
        );

        MembershipPlan saved = planRepository.save(plan);
        return toDto(saved);
    }

    @Transactional
    public PlanDto updatePlan(Long id, PlanDto dto) {
        MembershipPlan plan = planRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found with id: " + id));

        if (planRepository.existsByPlanNameAndPlanIdNot(dto.getPlanName().trim(), id)) {
            throw new BadRequestException("Another plan with name '" + dto.getPlanName() + "' already exists.");
        }
        if (dto.getDurationMonths() <= 0) {
            throw new BadRequestException("Plan duration must be at least 1 month.");
        }
        if (dto.getPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Plan price cannot be negative.");
        }

        plan.setPlanName(dto.getPlanName().trim());
        plan.setDurationMonths(dto.getDurationMonths());
        plan.setPrice(dto.getPrice());
        plan.setDescription(dto.getDescription() != null ? dto.getDescription().trim() : null);

        MembershipPlan updated = planRepository.save(plan);
        return toDto(updated);
    }

    @Transactional
    public void deletePlan(Long id) {
        MembershipPlan plan = planRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found with id: " + id));
        planRepository.delete(plan);
    }

    public PlanDto toDto(MembershipPlan entity) {
        PlanDto dto = new PlanDto();
        dto.setPlanId(entity.getPlanId());
        dto.setPlanName(entity.getPlanName());
        dto.setDurationMonths(entity.getDurationMonths());
        dto.setPrice(entity.getPrice());
        dto.setDescription(entity.getDescription());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}
