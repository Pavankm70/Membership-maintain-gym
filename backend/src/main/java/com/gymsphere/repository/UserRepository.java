package com.gymsphere.repository;

import com.gymsphere.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmailAndUserIdNot(String email, Long userId);

    @Query("SELECT u FROM User u WHERE " +
           "(:query IS NULL OR :query = '' OR " +
           " LOWER(u.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:role IS NULL OR :role = '' OR u.role = :role)")
    Page<User> searchUsers(@Param("query") String query,
                           @Param("role") String role,
                           Pageable pageable);
}
