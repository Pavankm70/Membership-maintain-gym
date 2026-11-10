package com.gymsphere.repository;

import com.gymsphere.entity.Trainer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TrainerRepository extends JpaRepository<Trainer, Long> {

    Optional<Trainer> findByEmail(String email);

    Optional<Trainer> findByEmailIgnoreCase(String email);

    boolean existsByEmailAndTrainerIdNot(String email, Long trainerId);

    boolean existsByEmailIgnoreCaseAndTrainerIdNot(String email, Long trainerId);

    @Query("SELECT t FROM Trainer t WHERE " +
           "(:query IS NULL OR :query = '' OR " +
           " LOWER(t.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(t.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " (t.specialization IS NOT NULL AND LOWER(t.specialization) LIKE LOWER(CONCAT('%', :query, '%')))) AND " +
           "(:status IS NULL OR :status = '' OR t.status = :status)")
    Page<Trainer> searchTrainers(@Param("query") String query,
                                 @Param("status") String status,
                                 Pageable pageable);

    long countByStatus(String status);
}
