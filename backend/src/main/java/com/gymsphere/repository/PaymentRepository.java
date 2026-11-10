package com.gymsphere.repository;

import com.gymsphere.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findBySubscriptionSubscriptionId(Long subscriptionId);

    boolean existsBySubscriptionSubscriptionId(Long subscriptionId);

    @Query("SELECT p FROM Payment p WHERE " +
           "(:status IS NULL OR :status = '' OR p.paymentStatus = :status) AND " +
           "(:method IS NULL OR :method = '' OR p.paymentMethod = :method) AND " +
           "(:startDate IS NULL OR p.paymentDate >= :startDate) AND " +
           "(:endDate IS NULL OR p.paymentDate <= :endDate)")
    Page<Payment> searchPayments(@Param("status") String status,
                                 @Param("method") String method,
                                 @Param("startDate") LocalDateTime startDate,
                                 @Param("endDate") LocalDateTime endDate,
                                 Pageable pageable);

    @Query("SELECT COALESCE(SUM(p.amount), 0.00) FROM Payment p WHERE p.paymentStatus = 'SUCCESS'")
    BigDecimal calculateTotalSuccessfulRevenue();

    @Query("SELECT FUNCTION('DATE_FORMAT', p.paymentDate, '%Y-%m') AS month, " +
           "COUNT(p) AS transactionCount, " +
           "SUM(CASE WHEN p.paymentStatus = 'SUCCESS' THEN p.amount ELSE 0.0 END) AS totalAmount " +
           "FROM Payment p " +
           "GROUP BY FUNCTION('DATE_FORMAT', p.paymentDate, '%Y-%m') " +
           "ORDER BY month ASC")
    List<Map<String, Object>> getMonthlyRevenueStats();

    List<Payment> findTop10ByOrderByPaymentDateDesc();
}
