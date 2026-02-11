package io.froebel.backend.repository;

import io.froebel.backend.model.entity.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserSessionRepository extends JpaRepository<UserSession, UUID> {

    List<UserSession> findByUserIdAndRevokedAtIsNullOrderByLastActiveAtDesc(UUID userId);

    Optional<UserSession> findByIdAndUserId(UUID id, UUID userId);

    Optional<UserSession> findByRefreshTokenId(UUID refreshTokenId);

    @Modifying
    @Query("UPDATE UserSession s SET s.revokedAt = :revokedAt WHERE s.user.id = :userId AND s.id != :currentSessionId AND s.revokedAt IS NULL")
    int revokeAllOtherSessions(UUID userId, UUID currentSessionId, Instant revokedAt);

    @Modifying
    @Query("UPDATE UserSession s SET s.revokedAt = :revokedAt WHERE s.user.id = :userId AND s.revokedAt IS NULL")
    int revokeAllUserSessions(UUID userId, Instant revokedAt);

    @Modifying
    @Query("UPDATE UserSession s SET s.lastActiveAt = :lastActiveAt WHERE s.id = :sessionId")
    int updateLastActiveAt(UUID sessionId, Instant lastActiveAt);

    long countByUserIdAndRevokedAtIsNull(UUID userId);
}
