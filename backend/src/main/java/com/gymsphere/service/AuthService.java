package com.gymsphere.service;

import com.gymsphere.dto.AuthDto;
import com.gymsphere.entity.User;
import com.gymsphere.exception.BadRequestException;
import com.gymsphere.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim())
                .orElseThrow(() -> new BadRequestException("Invalid email or password."));

        if (!user.isEnabled()) {
            throw new BadRequestException("This account has been disabled. Please contact the administrator.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Invalid email or password.");
        }

        // Generate session/bearer token (for local demo, UUID token verified by Security / Filter)
        String token = "gymsphere-session-" + UUID.randomUUID().toString();

        return new AuthDto.AuthResponse(
                token,
                user.getUserId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole()
        );
    }
}
