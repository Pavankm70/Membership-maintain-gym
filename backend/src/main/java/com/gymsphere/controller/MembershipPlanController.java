package com.gymsphere.controller;

import com.gymsphere.dto.PlanDto;
import com.gymsphere.service.MembershipPlanService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/plans")
public class MembershipPlanController {

    private final MembershipPlanService planService;

    public MembershipPlanController(MembershipPlanService planService) {
        this.planService = planService;
    }

    @GetMapping
    public ResponseEntity<List<PlanDto>> getAllPlans() {
        return ResponseEntity.ok(planService.getAllPlans());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlanDto> getPlanById(@PathVariable Long id) {
        return ResponseEntity.ok(planService.getPlanById(id));
    }

    @PostMapping
    public ResponseEntity<PlanDto> createPlan(@Valid @RequestBody PlanDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(planService.createPlan(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlanDto> updatePlan(@PathVariable Long id, @Valid @RequestBody PlanDto dto) {
        return ResponseEntity.ok(planService.updatePlan(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlan(@PathVariable Long id) {
        planService.deletePlan(id);
        return ResponseEntity.noContent().build();
    }
}
