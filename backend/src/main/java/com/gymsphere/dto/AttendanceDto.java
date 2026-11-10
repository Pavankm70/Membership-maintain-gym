package com.gymsphere.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class AttendanceDto {

    public static class CheckInRequest {
        @NotNull(message = "Member ID is required")
        private Long memberId;

        private LocalDateTime checkIn;

        public Long getMemberId() {
            return memberId;
        }

        public void setMemberId(Long memberId) {
            this.memberId = memberId;
        }

        public LocalDateTime getCheckIn() {
            return checkIn;
        }

        public void setCheckIn(LocalDateTime checkIn) {
            this.checkIn = checkIn;
        }
    }

    public static class CheckOutRequest {
        @NotNull(message = "Attendance ID is required")
        private Long attendanceId;

        private LocalDateTime checkOut;

        public Long getAttendanceId() {
            return attendanceId;
        }

        public void setAttendanceId(Long attendanceId) {
            this.attendanceId = attendanceId;
        }

        public LocalDateTime getCheckOut() {
            return checkOut;
        }

        public void setCheckOut(LocalDateTime checkOut) {
            this.checkOut = checkOut;
        }
    }

    public static class Response {
        private Long attendanceId;
        private Long memberId;
        private String memberName;
        private String memberEmail;
        private LocalDateTime checkIn;
        private LocalDateTime checkOut;
        private Long durationMinutes;
        private boolean isOpenSession;

        public Response() {
        }

        public Long getAttendanceId() {
            return attendanceId;
        }

        public void setAttendanceId(Long attendanceId) {
            this.attendanceId = attendanceId;
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

        public Long getDurationMinutes() {
            return durationMinutes;
        }

        public void setDurationMinutes(Long durationMinutes) {
            this.durationMinutes = durationMinutes;
        }

        public boolean isOpenSession() {
            return isOpenSession;
        }

        public void setOpenSession(boolean openSession) {
            isOpenSession = openSession;
        }
    }
}
