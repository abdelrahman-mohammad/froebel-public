package io.froebel.backend.repository;

import io.froebel.backend.model.entity.LoginAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.UUID;

@Repository
public interface LoginAttemptRepository extends JpaRepository<LoginAttempt, UUID> {

    /**
     * Count failed login attempts for an email within a time window.
     */
    @Query("SELECT COUNT(la) FROM LoginAttempt la WHERE la.email = :email AND la.successful = false AND la.attemptedAt > :since")
    long countFailedAttemptsSince(String email, Instant since);

    /**
     * Get the most recent failed attempt for an email.
     */
    @Query("SELECT la FROM LoginAttempt la WHERE la.email = :email AND la.successful = false ORDER BY la.attemptedAt DESC LIMIT 1")
    LoginAttempt findMostRecentFailedAttempt(String email);

    /**
     * Delete old login attempts (cleanup job).
     */
    @Modifying
    @Query("DELETE FROM LoginAttempt la WHERE la.attemptedAt < :before")
    int deleteAttemptsOlderThan(Instant before);

    /**
     * Delete all attempts for an email (on successful login or password reset).
     */
    @Modifying
    @Query("DELETE FROM LoginAttempt la WHERE la.email = :email")
    int deleteByEmail(String email);
}
