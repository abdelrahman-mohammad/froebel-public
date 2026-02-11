package io.froebel.backend.repository;

import io.froebel.backend.model.entity.DataExportRequest;
import io.froebel.backend.model.enums.ExportStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DataExportRequestRepository extends JpaRepository<DataExportRequest, UUID> {

    Optional<DataExportRequest> findByIdAndUserId(UUID id, UUID userId);

    List<DataExportRequest> findByUserIdOrderByRequestedAtDesc(UUID userId);

    List<DataExportRequest> findByStatus(ExportStatus status);

    List<DataExportRequest> findByStatusAndExpiresAtBefore(ExportStatus status, Instant expiresAt);

    @Query("SELECT COUNT(d) FROM DataExportRequest d WHERE d.user.id = :userId AND d.requestedAt > :since")
    long countByUserIdAndRequestedAtAfter(UUID userId, Instant since);
}
