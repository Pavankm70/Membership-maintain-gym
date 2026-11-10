package com.gymsphere.config;

import com.gymsphere.entity.User;
import com.gymsphere.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Ensure admin@gymsphere.com has a valid BCrypt hash for "admin123"
        Optional<User> adminOpt = userRepository.findByEmail("admin@gymsphere.com");
        if (adminOpt.isEmpty()) {
            log.info("Creating default administrator account: admin@gymsphere.com");
            User admin = new User(
                    "System Administrator",
                    "admin@gymsphere.com",
                    passwordEncoder.encode("admin123"),
                    "ROLE_ADMIN",
                    true
            );
            userRepository.save(admin);
        } else {
            User admin = adminOpt.get();
            if (!passwordEncoder.matches("admin123", admin.getPasswordHash())) {
                log.info("Updating admin@gymsphere.com with verified BCrypt hash for admin123");
                admin.setPasswordHash(passwordEncoder.encode("admin123"));
                userRepository.save(admin);
            }
        }

        // Ensure staff@gymsphere.com has a valid BCrypt hash for "staff123"
        Optional<User> staffOpt = userRepository.findByEmail("staff@gymsphere.com");
        if (staffOpt.isEmpty()) {
            log.info("Creating default staff account: staff@gymsphere.com");
            User staff = new User(
                    "Sarah Staffer",
                    "staff@gymsphere.com",
                    passwordEncoder.encode("staff123"),
                    "ROLE_STAFF",
                    true
            );
            userRepository.save(staff);
        } else {
            User staff = staffOpt.get();
            if (!passwordEncoder.matches("staff123", staff.getPasswordHash())) {
                log.info("Updating staff@gymsphere.com with verified BCrypt hash for staff123");
                staff.setPasswordHash(passwordEncoder.encode("staff123"));
                userRepository.save(staff);
            }
        }

        log.info("GymSphere user accounts verified with valid BCrypt credentials.");
    }
}
