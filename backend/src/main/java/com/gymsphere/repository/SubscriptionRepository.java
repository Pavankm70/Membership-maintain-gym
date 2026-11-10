package com.gymsphere.repository;

import com.gymsphere.entity.Subscription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    List<Subscription> findByMemberMemberId(Long memberId);

    @Query("SELECT s FROM Subscription s WHERE " +
           "(:query IS NULL OR :query = '' OR " +
           " LOWER(s.member.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(s.plan.planName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " (s.trainer IS NOT NULL AND LOWER(s.trainer.fullName) LIKE LOWER(CONCAT('%', :query, '%')))) AND " +
           "(:status IS NULL OR :status = '' OR s.status = :status)")
    Page<Subscription> searchSubscriptions(@Param("query") String query,
                                          @Param("status") String status,
                                          Pageable pageable);

    long countByStatus(String status);

    boolean existsByMemberMemberIdAndStatus(Long memberId, String status);

    @Query("SELECT s FROM Subscription s WHERE s.status = 'ACTIVE' AND s.endDate BETWEEN :start AND :end ORDER BY s.endDate ASC")
    List<Subscription> findExpiringSubscriptions(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT p.planName AS planName, COUNT(s) AS count, COALESCE(SUM(s.amountAtPurchase), 0.0) AS totalRevenue " +
           "FROM Subscription s JOIN s.plan p " +
           "GROUP BY p.planId, p.planName " +
           "ORDER BY totalRevenue DESC")
    List<Map<String, Object>> getPlanSubscriptionDistribution();
}
