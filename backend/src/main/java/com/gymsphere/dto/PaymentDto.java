package com.gymsphere.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PaymentDto {

    public static class CreateRequest {
        @NotNull(message = "Subscription ID is required")
        private Long subscriptionId;

        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
        private BigDecimal amount;

        @NotBlank(message = "Payment method is required")
        private String paymentMethod;

        private String paymentStatus = "SUCCESS";

        private String transactionRef;

        public Long getSubscriptionId() {
            return subscriptionId;
        }

        public void setSubscriptionId(Long subscriptionId) {
            this.subscriptionId = subscriptionId;
        }

        public BigDecimal getAmount() {
            return amount;
        }

        public void setAmount(BigDecimal amount) {
            this.amount = amount;
        }

        public String getPaymentMethod() {
            return paymentMethod;
        }

        public void setPaymentMethod(String paymentMethod) {
            this.paymentMethod = paymentMethod;
        }

        public String getPaymentStatus() {
            return paymentStatus;
        }

        public void setPaymentStatus(String paymentStatus) {
            this.paymentStatus = paymentStatus;
        }

        public String getTransactionRef() {
            return transactionRef;
        }

        public void setTransactionRef(String transactionRef) {
            this.transactionRef = transactionRef;
        }
    }

    public static class Response {
        private Long paymentId;
        private Long subscriptionId;
        private Long memberId;
        private String memberName;
        private String planName;
        private BigDecimal amount;
        private LocalDateTime paymentDate;
        private String paymentMethod;
        private String paymentStatus;
        private String transactionRef;

        public Response() {
        }

        public Long getPaymentId() {
            return paymentId;
        }

        public void setPaymentId(Long paymentId) {
            this.paymentId = paymentId;
        }

        public Long getSubscriptionId() {
            return subscriptionId;
        }

        public void setSubscriptionId(Long subscriptionId) {
            this.subscriptionId = subscriptionId;
        }

        public Long getMemberId() {
            return memberId;
        }

        public void setMemberId(Long memberId) {
            this.memberId = memberId;
        }

        public String getMemberName() {
            return memberName;
        }

        public void setMemberName(String memberName) {
            this.memberName = memberName;
        }

        public String getPlanName() {
            return planName;
        }

        public void setPlanName(String planName) {
            this.planName = planName;
        }

        public BigDecimal getAmount() {
            return amount;
        }

        public void setAmount(BigDecimal amount) {
            this.amount = amount;
        }

        public LocalDateTime getPaymentDate() {
            return paymentDate;
        }

        public void setPaymentDate(LocalDateTime paymentDate) {
            this.paymentDate = paymentDate;
        }

        public String getPaymentMethod() {
            return paymentMethod;
        }

        public void setPaymentMethod(String paymentMethod) {
            this.paymentMethod = paymentMethod;
        }

        public String getPaymentStatus() {
            return paymentStatus;
        }

        public void setPaymentStatus(String paymentStatus) {
            this.paymentStatus = paymentStatus;
        }

        public String getTransactionRef() {
            return transactionRef;
        }

        public void setTransactionRef(String transactionRef) {
            this.transactionRef = transactionRef;
        }
    }
}
