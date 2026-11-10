package com.gymsphere.service;

import com.gymsphere.dto.DashboardSummaryDto;
import com.gymsphere.dto.SubscriptionDto;
import com.gymsphere.repository.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final MemberRepository memberRepository;
    private final TrainerRepository trainerRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PaymentRepository paymentRepository;
    private final AttendanceRepository attendanceRepository;
    private final PaymentService paymentService;
    private final SubscriptionService subscriptionService;

    public ReportService(MemberRepository memberRepository,
                         TrainerRepository trainerRepository,
                         SubscriptionRepository subscriptionRepository,
                         PaymentRepository paymentRepository,
                         AttendanceRepository attendanceRepository,
                         PaymentService paymentService,
                         SubscriptionService subscriptionService) {
        this.memberRepository = memberRepository;
        this.trainerRepository = trainerRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.paymentRepository = paymentRepository;
        this.attendanceRepository = attendanceRepository;
        this.paymentService = paymentService;
        this.subscriptionService = subscriptionService;
    }

    public DashboardSummaryDto getDashboardSummary() {
        DashboardSummaryDto dto = new DashboardSummaryDto();

        dto.setTotalMembers(memberRepository.count());
        dto.setActiveMembers(memberRepository.countByStatus("ACTIVE"));
        dto.setActiveSubscriptions(subscriptionRepository.countByStatus("ACTIVE"));
        dto.setRegisteredTrainers(trainerRepository.count());

        BigDecimal totalRev = paymentRepository.calculateTotalSuccessfulRevenue();
        dto.setTotalRevenue(totalRev != null ? totalRev : BigDecimal.ZERO);

        dto.setCurrentlyCheckedIn(attendanceRepository.countCurrentlyCheckedIn());

        LocalDate now = LocalDate.now();
        List<SubscriptionDto.Response> expiring = subscriptionRepository
                .findExpiringSubscriptions(now, now.plusDays(30))
                .stream()
                .map(subscriptionService::toResponse)
                .collect(Collectors.toList());

        dto.setExpiringSoonCount(expiring.size());
        dto.setUpcomingExpirations(expiring);
        dto.setRecentPayments(paymentService.getRecentPayments());
        dto.setMonthlyRevenue(paymentRepository.getMonthlyRevenueStats());
        dto.setPlanDistribution(subscriptionRepository.getPlanSubscriptionDistribution());
        dto.setMemberStatusDistribution(memberRepository.countMembersGroupByStatus());

        return dto;
    }

    public List<Map<String, Object>> getMonthlyRevenueReport() {
        return paymentRepository.getMonthlyRevenueStats();
    }

    public List<Map<String, Object>> getPlanDistributionReport() {
        return subscriptionRepository.getPlanSubscriptionDistribution();
    }

    public List<Map<String, Object>> getMemberStatusDistribution() {
        return memberRepository.countMembersGroupByStatus();
    }

    public List<SubscriptionDto.Response> getUpcomingExpirations(int days) {
        LocalDate now = LocalDate.now();
        return subscriptionRepository.findExpiringSubscriptions(now, now.plusDays(days))
                .stream()
                .map(subscriptionService::toResponse)
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getDailyAttendanceReport(int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        return attendanceRepository.getDailyAttendanceStats(since);
    }

    public List<Map<String, Object>> getPeakHourReport() {
        return attendanceRepository.getPeakHourStats();
    }
}
