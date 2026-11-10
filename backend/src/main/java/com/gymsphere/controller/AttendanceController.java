package com.gymsphere.controller;

import com.gymsphere.dto.AttendanceDto;
import com.gymsphere.service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping
    public ResponseEntity<Page<AttendanceDto.Response>> getAllAttendance(
            @RequestParam(required = false) Long memberId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "checkIn") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = "desc".equalsIgnoreCase(direction) ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        PageRequest pageRequest = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(attendanceService.searchAttendance(memberId, startDate, endDate, pageRequest));
    }

    @PostMapping("/check-in")
    public ResponseEntity<AttendanceDto.Response> checkIn(@Valid @RequestBody AttendanceDto.CheckInRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(attendanceService.checkIn(request));
    }

    @PostMapping("/check-out")
    public ResponseEntity<AttendanceDto.Response> checkOut(@Valid @RequestBody AttendanceDto.CheckOutRequest request) {
        return ResponseEntity.ok(attendanceService.checkOut(request));
    }

    @GetMapping("/active-count")
    public ResponseEntity<Long> getActiveCount() {
        return ResponseEntity.ok(attendanceService.getCurrentlyCheckedInCount());
    }
}
