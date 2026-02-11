package io.froebel.backend.repository;

import io.froebel.backend.model.entity.TwoFactorBackupCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TwoFactorBackupCodeRepository extends JpaRepository<TwoFactorBackupCode, UUID> {

    List<TwoFactorBackupCode> findByUserIdAndUsedAtIsNull(UUID userId);

    long countByUserIdAndUsedAtIsNull(UUID userId);

    void deleteByUserId(UUID userId);
}
