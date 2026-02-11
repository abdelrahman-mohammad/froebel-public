package io.froebel.backend.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

/**
 * Tracks failed login attempts for account lockout functionality.
 * Records are automatically cleaned up after the lockout window expires.
 */
@Entity
@Table(name = "login_attempt", indexes = {
    @Index(name = "idx_login_attempts_email", columnList = "email"),
    @Index(name = "idx_login_attempts_email_timestamp", columnList = "email, attemptedAt")
})
public class LoginAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String ipAddress;

    @Column(nullable = false)
    private Instant attemptedAt;

    @Column(nullable = false)
    private boolean successful;

    public LoginAttempt() {
    }

    public LoginAttempt(String email, String ipAddress, boolean successful) {
        this.email = email;
        this.ipAddress = ipAddress;
        this.attemptedAt = Instant.now();
        this.successful = successful;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public Instant getAttemptedAt() {
        return attemptedAt;
    }

    public void setAttemptedAt(Instant attemptedAt) {
        this.attemptedAt = attemptedAt;
    }

    public boolean isSuccessful() {
        return successful;
    }

    public void setSuccessful(boolean successful) {
        this.successful = successful;
    }
}
