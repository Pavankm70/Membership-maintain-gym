package com.gymsphere.repository;

import com.gymsphere.entity.Member;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {

    Optional<Member> findByEmail(String email);

    Optional<Member> findByPhone(String phone);

    boolean existsByEmailAndMemberIdNot(String email, Long memberId);

    boolean existsByPhoneAndMemberIdNot(String phone, Long memberId);

    @Query("SELECT m FROM Member m WHERE " +
           "(:query IS NULL OR :query = '' OR " +
           " LOWER(m.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(m.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " m.phone LIKE CONCAT('%', :query, '%')) AND " +
           "(:status IS NULL OR :status = '' OR m.status = :status)")
    Page<Member> searchMembers(@Param("query") String query,
                               @Param("status") String status,
                               Pageable pageable);

    long countByStatus(String status);

    @Query("SELECT m.status AS status, COUNT(m) AS count FROM Member m GROUP BY m.status")
    List<Map<String, Object>> countMembersGroupByStatus();
}
