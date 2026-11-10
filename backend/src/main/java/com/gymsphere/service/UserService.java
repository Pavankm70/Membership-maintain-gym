package com.gymsphere.service;

import com.gymsphere.dto.UserDto;
import com.gymsphere.entity.User;
import com.gymsphere.exception.BadRequestException;
import com.gymsphere.exception.ResourceNotFoundException;
import com.gymsphere.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Page<UserDto.Response> searchUsers(String query, String role, Pageable pageable) {
        return userRepository.searchUsers(query, role, pageable)
                .map(this::toResponse);
    }

    public UserDto.Response getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return toResponse(user);
    }

    @Transactional
    public UserDto.Response createUser(UserDto.CreateRequest request) {
        if (userRepository.findByEmail(request.getEmail().trim()).isPresent()) {
            throw new BadRequestException("A user account with email '" + request.getEmail() + "' already exists.");
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());
        String role = request.getRole() != null ? request.getRole() : "ROLE_STAFF";

        User user = new User(
                request.getFullName().trim(),
                request.getEmail().trim(),
                encodedPassword,
                role,
                true
        );

        User saved = userRepository.save(user);
        return toResponse(saved);
    }

    @Transactional
    public UserDto.Response updateUser(Long id, UserDto.UpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (userRepository.existsByEmailAndUserIdNot(request.getEmail().trim(), id)) {
            throw new BadRequestException("Another user already exists with email '" + request.getEmail() + "'.");
        }

        user.setFullName(request.getFullName().trim());
        user.setEmail(request.getEmail().trim());
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }
        if (request.getEnabled() != null) {
            user.setEnabled(request.getEnabled());
        }

        User updated = userRepository.save(user);
        return toResponse(updated);
    }

    @Transactional
    public void changePassword(Long id, UserDto.ChangePasswordRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password does not match.");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        userRepository.delete(user);
    }

    public UserDto.Response toResponse(User u) {
        UserDto.Response r = new UserDto.Response();
        r.setUserId(u.getUserId());
        r.setFullName(u.getFullName());
        r.setEmail(u.getEmail());
        r.setRole(u.getRole());
        r.setEnabled(u.isEnabled());
        r.setCreatedAt(u.getCreatedAt());
        return r;
    }
}
