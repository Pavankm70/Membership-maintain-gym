package com.gymsphere.service;

import com.gymsphere.dto.PaymentDto;
import com.gymsphere.entity.Payment;
import com.gymsphere.entity.Subscription;
import com.gymsphere.exception.BadRequestException;
import com.gymsphere.exception.ResourceNotFoundException;
import com.gymsphere.repository.PaymentRepository;
import com.gymsphere.repository.SubscriptionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final SubscriptionRepository subscriptionRepository;

    public PaymentService(PaymentRepository paymentRepository, SubscriptionRepository subscriptionRepository) {
        this.paymentRepository = paymentRepository;
        this.subscriptionRepository = subscriptionRepository;
    }

    public Page<PaymentDto.Response> searchPayments(String status, String method, LocalDateTime start, LocalDateTime end, Pageable pageable) {
        return paymentRepository.searchPayments(status, method, start, end, pageable)
                .map(this::toResponse);
    }

    public List<PaymentDto.Response> getPaymentsBySubscriptionId(Long subscriptionId) {
        return paymentRepository.findBySubscriptionSubscriptionId(subscriptionId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<PaymentDto.Response> getRecentPayments() {
        return paymentRepository.findTop10ByOrderByPaymentDateDesc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public BigDecimal getTotalCollectedRevenue() {
        return paymentRepository.calculateTotalSuccessfulRevenue();
    }

    @Transactional
    public PaymentDto.Response recordPayment(PaymentDto.CreateRequest request) {
        Subscription subscription = subscriptionRepository.findById(request.getSubscriptionId())
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found with id: " + request.getSubscriptionId()));

        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Payment amount must be greater than zero.");
        }

        String ref = request.getTransactionRef();
        if (ref == null || ref.trim().isEmpty()) {
            ref = "TXN-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        }

        String status = request.getPaymentStatus() != null ? request.getPaymentStatus().toUpperCase().trim() : "SUCCESS";
        if (!status.equals("SUCCESS") && !status.equals("PENDING") && !status.equals("FAILED") && !status.equals("REFUNDED")) {
            throw new BadRequestException("Invalid payment status: " + status);
        }

        Payment payment = new Payment(
                subscription,
                request.getAmount(),
                LocalDateTime.now(),
                request.getPaymentMethod().trim(),
                status,
                ref
        );

        Payment saved = paymentRepository.save(payment);
        return toResponse(saved);
    }

    public PaymentDto.Response toResponse(Payment p) {
        PaymentDto.Response r = new PaymentDto.Response();
        r.setPaymentId(p.getPaymentId());
        r.setSubscriptionId(p.getSubscription().getSubscriptionId());
        r.setMemberId(p.getSubscription().getMember().getMemberId());
        r.setMemberName(p.getSubscription().getMember().getFullName());
        r.setPlanName(p.getSubscription().getPlan().getPlanName());
        r.setAmount(p.getAmount());
        r.setPaymentDate(p.getPaymentDate());
        r.setPaymentMethod(p.getPaymentMethod());
        r.setPaymentStatus(p.getPaymentStatus());
        r.setTransactionRef(p.getTransactionRef());
        return r;
    }
}
