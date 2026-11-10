package com.gymsphere.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "trainers")
public class Trainer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "trainer_id")
    private Long trainerId;

    @NotBlank(message = "Trainer name is required")
    @Size(max = 100, message = "Full name cannot exceed 100 characters")
    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Size(max = 150, message = "Email cannot exceed 150 characters")
    @Column(name = "email", nullable = false, unique = true, length = 150)
    private String email;

    @Size(max = 20, message = "Phone cannot exceed 20 characters")
    @Column(name = "phone", length = 20)
    private String phone;

    @Size(max = 100, message = "Specialization cannot exceed 100 characters")
    @Column(name = "specialization", length = 100)
    private String specialization;

    @NotNull
    @Column(name = "status", nullable = false, length = 20)
    private String status = "ACTIVE";

    public Trainer() {
    }

    public Trainer(String fullName, String email, String phone, String specialization, String status) {
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.specialization = specialization;
        this.status = status != null ? status : "ACTIVE";
    }

    public Long getTrainerId() {
        return trainerId;
    }

    public void setTrainerId(Long trainerId) {
        this.trainerId = trainerId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
