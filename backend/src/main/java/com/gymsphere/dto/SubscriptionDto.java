package com.gymsphere.dto;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class SubscriptionDto {

    public static class CreateRequest {
        @NotNull(message = "Member ID is required")
        private Long memberId;

        @NotNull(message = "Plan ID is required")
        private Long planId;

        private Long trainerId;

        private LocalDate startDate;

        public Long getMemberId() {
            return memberId;
        }

        public void setMemberId(Long memberId) {
            this.memberId = memberId;
        }

        public Long getPlanId() {
            return planId;
        }

        public void setPlanId(Long planId) {
            this.planId = planId;
        }

        public Long getTrainerId() {
            return trainerId;
        }

        public void setTrainerId(Long trainerId) {
            this.trainerId = trainerId;
        }

        public LocalDate getStartDate() {
            return startDate;
        }

        public void setStartDate(LocalDate startDate) {
            this.startDate = startDate;
        }
    }

    public static class Response {
        private Long subscriptionId;
        private Long memberId;
        private String memberName;
        private String memberEmail;
        private String memberPhone;
        private Long planId;
        private String planName;
        private Integer durationMonths;
        private Long trainerId;
        private String trainerName;
        private LocalDate startDate;
        private LocalDate endDate;
        private String status;
        private BigDecimal amountAtPurchase;
        private LocalDateTime createdAt;
        private long daysRemaining;

        public Response() {
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

        public String getMemberEmail() {
            return memberEmail;
        }

        public void setMemberEmail(String memberEmail) {
            this.memberEmail = memberEmail;
        }

        public String getMemberPhone() {
            return memberPhone;
        }

        public void setMemberPhone(String memberPhone) {
            this.memberPhone = memberPhone;
        }

        public Long getPlanId() {
            return planId;
        }

        public void setPlanId(Long planId) {
            this.planId = planId;
        }

        public String getPlanName() {
            return planName;
        }

        public void setPlanName(String planName) {
            this.planName = planName;
        }

        public Integer getDurationMonths() {
            return durationMonths;
        }

        public void setDurationMonths(Integer durationMonths) {
            this.durationMonths = durationMonths;
        }

        public Long getTrainerId() {
            return trainerId;
        }

        public void setTrainerId(Long trainerId) {
            this.trainerId = trainerId;
        }

        public String getTrainerName() {
            return trainerName;
        }

        public void setTrainerName(String trainerName) {
            this.trainerName = trainerName;
        }

        public LocalDate getStartDate() {
            return startDate;
        }

        public void setStartDate(LocalDate startDate) {
            this.startDate = startDate;
        }

        public LocalDate getEndDate() {
            return endDate;
        }

        public void setEndDate(LocalDate endDate) {
            this.endDate = endDate;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public BigDecimal getAmountAtPurchase() {
            return amountAtPurchase;
        }

        public void setAmountAtPurchase(BigDecimal amountAtPurchase) {
            this.amountAtPurchase = amountAtPurchase;
        }

        public LocalDateTime getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
        }

        public long getDaysRemaining() {
            return daysRemaining;
        }

        public void setDaysRemaining(long daysRemaining) {
            this.daysRemaining = daysRemaining;
        }
    }
}
