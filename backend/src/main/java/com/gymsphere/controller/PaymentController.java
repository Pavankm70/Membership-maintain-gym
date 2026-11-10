package com.gymsphere.controller;

import com.gymsphere.dto.PaymentDto;
import com.gymsphere.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping
    public ResponseEntity<Page<PaymentDto.Response>> getAllPayments(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String method,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "paymentDate") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = "desc".equalsIgnoreCase(direction) ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        PageRequest pageRequest = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(paymentService.searchPayments(status, method, startDate, endDate, pageRequest));
    }

    @GetMapping("/subscription/{subscriptionId}")
    public ResponseEntity<List<PaymentDto.Response>> getPaymentsBySubscription(@PathVariable Long subscriptionId) {
        return ResponseEntity.ok(paymentService.getPaymentsBySubscriptionId(subscriptionId));
    }

    @PostMapping
    public ResponseEntity<PaymentDto.Response> recordPayment(@Valid @RequestBody PaymentDto.CreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.recordPayment(request));
    }
}
