package io.froebel.backend.repository;

import io.froebel.backend.model.entity.EmailChangeRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmailChangeRequestRepository extends JpaRepository<EmailChangeRequest, UUID> {

    Optional<EmailChangeRequest> findByToken(String token);

    Optional<EmailChangeRequest> findByUserIdAndConfirmedAtIsNull(UUID userId);

    boolean existsByNewEmailAndConfirmedAtIsNull(String newEmail);

    void deleteByUserId(UUID userId);
}
