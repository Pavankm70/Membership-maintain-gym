package com.gymsphere.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class DashboardSummaryDto {

    private long totalMembers;
    private long activeMembers;
    private long activeSubscriptions;
    private long registeredTrainers;
    private BigDecimal totalRevenue;
    private long currentlyCheckedIn;
    private long expiringSoonCount;

    private List<PaymentDto.Response> recentPayments;
    private List<SubscriptionDto.Response> upcomingExpirations;
    private List<Map<String, Object>> monthlyRevenue;
    private List<Map<String, Object>> planDistribution;
    private List<Map<String, Object>> memberStatusDistribution;

    public DashboardSummaryDto() {
    }

    public long getTotalMembers() {
        return totalMembers;
    }

    public void setTotalMembers(long totalMembers) {
        this.totalMembers = totalMembers;
    }

    public long getActiveMembers() {
        return activeMembers;
    }

    public void setActiveMembers(long activeMembers) {
        this.activeMembers = activeMembers;
    }

    public long getActiveSubscriptions() {
        return activeSubscriptions;
    }

    public void setActiveSubscriptions(long activeSubscriptions) {
        this.activeSubscriptions = activeSubscriptions;
    }

    public long getRegisteredTrainers() {
        return registeredTrainers;
    }

    public void setRegisteredTrainers(long registeredTrainers) {
        this.registeredTrainers = registeredTrainers;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public long getCurrentlyCheckedIn() {
        return currentlyCheckedIn;
    }

    public void setCurrentlyCheckedIn(long currentlyCheckedIn) {
        this.currentlyCheckedIn = currentlyCheckedIn;
    }

    public long getExpiringSoonCount() {
        return expiringSoonCount;
    }

    public void setExpiringSoonCount(long expiringSoonCount) {
        this.expiringSoonCount = expiringSoonCount;
    }

    public List<PaymentDto.Response> getRecentPayments() {
        return recentPayments;
    }

    public void setRecentPayments(List<PaymentDto.Response> recentPayments) {
        this.recentPayments = recentPayments;
    }

    public List<SubscriptionDto.Response> getUpcomingExpirations() {
        return upcomingExpirations;
    }

    public void setUpcomingExpirations(List<SubscriptionDto.Response> upcomingExpirations) {
        this.upcomingExpirations = upcomingExpirations;
    }

    public List<Map<String, Object>> getMonthlyRevenue() {
        return monthlyRevenue;
    }

    public void setMonthlyRevenue(List<Map<String, Object>> monthlyRevenue) {
        this.monthlyRevenue = monthlyRevenue;
    }

    public List<Map<String, Object>> getPlanDistribution() {
        return planDistribution;
    }

    public void setPlanDistribution(List<Map<String, Object>> planDistribution) {
        this.planDistribution = planDistribution;
    }

    public List<Map<String, Object>> getMemberStatusDistribution() {
        return memberStatusDistribution;
    }

    public void setMemberStatusDistribution(List<Map<String, Object>> memberStatusDistribution) {
        this.memberStatusDistribution = memberStatusDistribution;
    }
}
