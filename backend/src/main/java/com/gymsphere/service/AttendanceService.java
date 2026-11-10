package com.gymsphere.service;

import com.gymsphere.dto.AttendanceDto;
import com.gymsphere.entity.Attendance;
import com.gymsphere.entity.Member;
import com.gymsphere.exception.BadRequestException;
import com.gymsphere.exception.ResourceNotFoundException;
import com.gymsphere.repository.AttendanceRepository;
import com.gymsphere.repository.MemberRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final MemberRepository memberRepository;

    public AttendanceService(AttendanceRepository attendanceRepository, MemberRepository memberRepository) {
        this.attendanceRepository = attendanceRepository;
        this.memberRepository = memberRepository;
    }

    public Page<AttendanceDto.Response> searchAttendance(Long memberId, LocalDateTime start, LocalDateTime end, Pageable pageable) {
        return attendanceRepository.searchAttendance(memberId, start, end, pageable)
                .map(this::toResponse);
    }

    @Transactional
    public AttendanceDto.Response checkIn(AttendanceDto.CheckInRequest request) {
        Member member = memberRepository.findById(request.getMemberId())
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with id: " + request.getMemberId()));

        if (!"ACTIVE".equalsIgnoreCase(member.getStatus())) {
            throw new BadRequestException("Member '" + member.getFullName() + "' status is '" + member.getStatus() + "'. Only ACTIVE members may check into the gym.");
        }

        // Business Rule: Prevent multiple open attendance sessions for the same member
        if (attendanceRepository.findOpenSessionByMemberId(member.getMemberId()).isPresent()) {
            throw new BadRequestException("Member '" + member.getFullName() + "' is already checked in and has an open active workout session. Please check out first.");
        }

        LocalDateTime checkInTime = request.getCheckIn() != null ? request.getCheckIn() : LocalDateTime.now();

        Attendance attendance = new Attendance(
                member,
                checkInTime,
                null
        );

        Attendance saved = attendanceRepository.save(attendance);
        return toResponse(saved);
    }

    @Transactional
    public AttendanceDto.Response checkOut(AttendanceDto.CheckOutRequest request) {
        Attendance attendance = attendanceRepository.findById(request.getAttendanceId())
                .orElseThrow(() -> new ResourceNotFoundException("Attendance session not found with id: " + request.getAttendanceId()));

        if (attendance.getCheckOut() != null) {
            throw new BadRequestException("This attendance session has already been checked out at " + attendance.getCheckOut());
        }

        LocalDateTime checkOutTime = request.getCheckOut() != null ? request.getCheckOut() : LocalDateTime.now();

        // Business Rule: Validate that checkout occurs after checkin
        if (checkOutTime.isBefore(attendance.getCheckIn())) {
            throw new BadRequestException("Check-out time (" + checkOutTime + ") cannot be earlier than check-in time (" + attendance.getCheckIn() + ").");
        }

        attendance.setCheckOut(checkOutTime);
        Attendance updated = attendanceRepository.save(attendance);
        return toResponse(updated);
    }

    public long getCurrentlyCheckedInCount() {
        return attendanceRepository.countCurrentlyCheckedIn();
    }

    public AttendanceDto.Response toResponse(Attendance a) {
        AttendanceDto.Response r = new AttendanceDto.Response();
        r.setAttendanceId(a.getAttendanceId());
        r.setMemberId(a.getMember().getMemberId());
        r.setMemberName(a.getMember().getFullName());
        r.setMemberEmail(a.getMember().getEmail());
        r.setCheckIn(a.getCheckIn());
        r.setCheckOut(a.getCheckOut());

        if (a.getCheckOut() != null) {
            r.setDurationMinutes(Duration.between(a.getCheckIn(), a.getCheckOut()).toMinutes());
            r.setOpenSession(false);
        } else {
            r.setDurationMinutes(Duration.between(a.getCheckIn(), LocalDateTime.now()).toMinutes());
            r.setOpenSession(true);
        }

        return r;
    }
}
