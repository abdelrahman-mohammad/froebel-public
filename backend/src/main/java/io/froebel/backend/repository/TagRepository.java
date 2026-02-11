package io.froebel.backend.repository;

import io.froebel.backend.model.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public interface TagRepository extends JpaRepository<Tag, UUID> {

    Optional<Tag> findByName(String name);

    Optional<Tag> findBySlug(String slug);

    Set<Tag> findByNameIn(Set<String> names);
}
