package com.gymsphere.controller;

import com.gymsphere.dto.SubscriptionDto;
import com.gymsphere.service.SubscriptionService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @GetMapping
    public ResponseEntity<Page<SubscriptionDto.Response>> getAllSubscriptions(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "subscriptionId") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = "desc".equalsIgnoreCase(direction) ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        PageRequest pageRequest = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(subscriptionService.searchSubscriptions(query, status, pageRequest));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubscriptionDto.Response> getSubscriptionById(@PathVariable Long id) {
        return ResponseEntity.ok(subscriptionService.getSubscriptionById(id));
    }

    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<SubscriptionDto.Response>> getSubscriptionsByMember(@PathVariable Long memberId) {
        return ResponseEntity.ok(subscriptionService.getSubscriptionsByMemberId(memberId));
    }

    @PostMapping
    public ResponseEntity<SubscriptionDto.Response> createSubscription(@Valid @RequestBody SubscriptionDto.CreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(subscriptionService.createSubscription(request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<SubscriptionDto.Response> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String status = body != null ? body.get("status") : null;
        return ResponseEntity.ok(subscriptionService.updateStatus(id, status));
    }

    @PatchMapping("/{id}/trainer")
    public ResponseEntity<SubscriptionDto.Response> updateTrainer(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        Long trainerId = null;
        if (body != null && body.get("trainerId") != null) {
            Object val = body.get("trainerId");
            if (val instanceof Number) {
                trainerId = ((Number) val).longValue();
            } else if (!val.toString().trim().isEmpty()) {
                trainerId = Long.parseLong(val.toString().trim());
            }
        }
        return ResponseEntity.ok(subscriptionService.updateTrainer(id, trainerId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubscription(@PathVariable Long id) {
        subscriptionService.deleteSubscription(id);
        return ResponseEntity.noContent().build();
    }
}
