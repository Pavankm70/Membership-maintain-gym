package com.gymsphere.repository;

import com.gymsphere.entity.Attendance;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    @Query("SELECT a FROM Attendance a WHERE a.member.memberId = :memberId AND a.checkOut IS NULL")
    Optional<Attendance> findOpenSessionByMemberId(@Param("memberId") Long memberId);

    @Query("SELECT a FROM Attendance a WHERE " +
           "(:memberId IS NULL OR a.member.memberId = :memberId) AND " +
           "(:startDate IS NULL OR a.checkIn >= :startDate) AND " +
           "(:endDate IS NULL OR a.checkIn <= :endDate)")
    Page<Attendance> searchAttendance(@Param("memberId") Long memberId,
                                      @Param("startDate") LocalDateTime startDate,
                                      @Param("endDate") LocalDateTime endDate,
                                      Pageable pageable);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.checkOut IS NULL")
    long countCurrentlyCheckedIn();

    @Query("SELECT FUNCTION('DATE_FORMAT', a.checkIn, '%Y-%m-%d') AS day, COUNT(a) AS count " +
           "FROM Attendance a " +
           "WHERE a.checkIn >= :since " +
           "GROUP BY FUNCTION('DATE_FORMAT', a.checkIn, '%Y-%m-%d') " +
           "ORDER BY day ASC")
    List<Map<String, Object>> getDailyAttendanceStats(@Param("since") LocalDateTime since);

    @Query("SELECT FUNCTION('HOUR', a.checkIn) AS hour, COUNT(a) AS count " +
           "FROM Attendance a " +
           "GROUP BY FUNCTION('HOUR', a.checkIn) " +
           "ORDER BY hour ASC")
    List<Map<String, Object>> getPeakHourStats();
}
