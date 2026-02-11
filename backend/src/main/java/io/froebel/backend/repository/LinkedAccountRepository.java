package io.froebel.backend.repository;

import io.froebel.backend.model.entity.LinkedAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LinkedAccountRepository extends JpaRepository<LinkedAccount, UUID> {

    Optional<LinkedAccount> findByProviderAndProviderId(String provider, String providerId);

    List<LinkedAccount> findByUserId(UUID userId);

    Optional<LinkedAccount> findByUserIdAndProvider(UUID userId, String provider);

    boolean existsByUserIdAndProvider(UUID userId, String provider);

    long countByUserId(UUID userId);

    void deleteByUserIdAndProvider(UUID userId, String provider);
}
