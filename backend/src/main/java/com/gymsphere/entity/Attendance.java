package com.gymsphere.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

@Entity
@Table(name = "attendance")
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "attendance_id")
    private Long attendanceId;

    @NotNull(message = "Member is required")
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @NotNull(message = "Check-in time is required")
    @Column(name = "check_in", nullable = false)
    private LocalDateTime checkIn = LocalDateTime.now();

    @Column(name = "check_out")
    private LocalDateTime checkOut;

    public Attendance() {
    }

    public Attendance(Member member, LocalDateTime checkIn, LocalDateTime checkOut) {
        this.member = member;
        this.checkIn = checkIn != null ? checkIn : LocalDateTime.now();
        this.checkOut = checkOut;
    }

    public Long getAttendanceId() {
        return attendanceId;
    }

    public void setAttendanceId(Long attendanceId) {
        this.attendanceId = attendanceId;
    }

    public Member getMember() {
        return member;
    }

    public void setMember(Member member) {
        this.member = member;
    }

    public LocalDateTime getCheckIn() {
        return checkIn;
    }

    public void setCheckIn(LocalDateTime checkIn) {
        this.checkIn = checkIn;
    }

    public LocalDateTime getCheckOut() {
        return checkOut;
    }

    public void setCheckOut(LocalDateTime checkOut) {
        this.checkOut = checkOut;
    }
}
