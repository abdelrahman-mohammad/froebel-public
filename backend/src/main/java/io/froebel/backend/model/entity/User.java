package io.froebel.backend.model.entity;

import io.froebel.backend.model.enums.Role;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "`user`")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String email;

    @Column
    private String password;

    @Column(nullable = false)
    private String displayName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column
    private String avatarUrl;

    // OAuth2 fields (deprecated - use LinkedAccount instead)
    @Deprecated
    @Column
    @Builder.Default
    private String provider = "local";

    @Deprecated
    @Column
    private String providerId;

    // Two-Factor Authentication
    @Column(name = "two_factor_enabled", nullable = false)
    @Builder.Default
    private boolean twoFactorEnabled = false;

    @Column(name = "two_factor_secret", length = 32)
    private String twoFactorSecret;

    @Column(name = "two_factor_confirmed_at")
    private Instant twoFactorConfirmedAt;

    // Email verification
    @Column(nullable = false)
    @Builder.Default
    private boolean emailVerified = false;

    @Column
    private String emailVerificationToken;

    @Column
    private Instant emailVerificationTokenExpiry;

    // Extended profile fields
    @Column
    private String fullName;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column
    private String location;

    @Column(length = 500)
    private String website;

    @Column(columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    @Builder.Default
    private Map<String, String> socialLinks = new HashMap<>();

    // Privacy settings
    @Column(nullable = false)
    @Builder.Default
    private boolean profilePublic = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean showEmail = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean showStats = true;

    @OneToMany(mappedBy = "creator", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Course> courses = new ArrayList<>();

    @OneToMany(mappedBy = "creator", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Quiz> quizzes = new ArrayList<>();

    // Linked OAuth accounts
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<LinkedAccount> linkedAccounts = new ArrayList<>();
}
