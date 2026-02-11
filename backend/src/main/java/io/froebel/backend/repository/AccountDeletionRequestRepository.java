package io.froebel.backend.repository;

import io.froebel.backend.model.entity.AccountDeletionRequest;
import io.froebel.backend.model.enums.DeletionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AccountDeletionRequestRepository extends JpaRepository<AccountDeletionRequest, UUID> {

    Optional<AccountDeletionRequest> findByUserIdAndStatus(UUID userId, DeletionStatus status);

    List<AccountDeletionRequest> findByStatusAndScheduledDeletionBefore(DeletionStatus status, Instant scheduledDeletion);

    boolean existsByUserIdAndStatus(UUID userId, DeletionStatus status);
}
