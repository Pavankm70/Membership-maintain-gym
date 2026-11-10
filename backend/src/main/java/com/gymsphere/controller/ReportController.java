package com.gymsphere.controller;

import com.gymsphere.dto.DashboardSummaryDto;
import com.gymsphere.dto.SubscriptionDto;
import com.gymsphere.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardSummaryDto> getDashboardSummary() {
        return ResponseEntity.ok(reportService.getDashboardSummary());
    }

    @GetMapping("/revenue-monthly")
    public ResponseEntity<List<Map<String, Object>>> getMonthlyRevenue() {
        return ResponseEntity.ok(reportService.getMonthlyRevenueReport());
    }

    @GetMapping("/plan-distribution")
    public ResponseEntity<List<Map<String, Object>>> getPlanDistribution() {
        return ResponseEntity.ok(reportService.getPlanDistributionReport());
    }

    @GetMapping("/member-status")
    public ResponseEntity<List<Map<String, Object>>> getMemberStatus() {
        return ResponseEntity.ok(reportService.getMemberStatusDistribution());
    }

    @GetMapping("/expiring-subscriptions")
    public ResponseEntity<List<SubscriptionDto.Response>> getExpiringSubscriptions(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(reportService.getUpcomingExpirations(days));
    }

    @GetMapping("/attendance-daily")
    public ResponseEntity<List<Map<String, Object>>> getDailyAttendance(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(reportService.getDailyAttendanceReport(days));
    }

    @GetMapping("/peak-hours")
    public ResponseEntity<List<Map<String, Object>>> getPeakHours() {
        return ResponseEntity.ok(reportService.getPeakHourReport());
    }
}
