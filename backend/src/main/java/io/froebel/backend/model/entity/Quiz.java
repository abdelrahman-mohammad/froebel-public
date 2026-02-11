package io.froebel.backend.model.entity;

import io.froebel.backend.model.enums.QuizAvailabilityStatus;
import io.froebel.backend.model.enums.QuizStatus;
import io.froebel.backend.quiz.util.IpAddressUtil;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.NamedAttributeNode;
import jakarta.persistence.NamedEntityGraph;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "quiz")
@NamedEntityGraph(
    name = "Quiz.withDetails",
    attributeNodes = {
        @NamedAttributeNode("creator"),
        @NamedAttributeNode("course"),
        @NamedAttributeNode("category"),
        @NamedAttributeNode("questions"),
        @NamedAttributeNode("tags")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Quiz extends BaseEntity {

    @Column(nullable = false)
    private String title;

    @Column(name = "shareable_id", nullable = false, unique = true, length = 8, updatable = false)
    private String shareableId;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String iconUrl;

    @Column(columnDefinition = "TEXT")
    private String bannerUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id")
    private Lesson lesson;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private QuizStatus status = QuizStatus.DRAFT;

    @Column(nullable = false)
    @Builder.Default
    private boolean isPublic = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean allowAnonymous = false;

    @Column(name = "time_limit")
    private Integer timeLimit;

    @Column
    private Integer passingScore;

    @Column(nullable = false)
    @Builder.Default
    private boolean shuffleQuestions = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean shuffleChoices = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean showCorrectAnswers = true;

    @Column
    private Integer maxAttempts;

    @Column(nullable = false)
    @Builder.Default
    private boolean aiGradingEnabled = false;

    // Scheduling fields
    @Column
    private Instant availableFrom;

    @Column
    private Instant availableUntil;

    @Column
    private Instant resultsVisibleFrom;

    // Access restriction fields
    @Column(nullable = false)
    @Builder.Default
    private boolean requireAccessCode = false;

    @Column(length = 72)  // BCrypt hash length
    private String accessCode;

    @Column(nullable = false)
    @Builder.Default
    private boolean filterIpAddresses = false;

    @Column(columnDefinition = "TEXT")
    private String allowedIpAddresses;

    // Optimistic locking version for concurrent edit detection
    @Version
    private Long version;

    // Published version tracking - points to quiz_history.version_number
    @Column(name = "published_version_number")
    private Integer publishedVersionNumber;

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("questionOrder ASC")
    @Fetch(FetchMode.SUBSELECT)  // Prevent Cartesian product with tags when using EntityGraph
    @Builder.Default
    private List<Question> questions = new ArrayList<>();

    @ManyToMany
    @JoinTable(
        name = "quiz_tag",
        joinColumns = @JoinColumn(name = "quiz_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    @Fetch(FetchMode.SUBSELECT)  // Prevent Cartesian product with questions when using EntityGraph
    @Builder.Default
    private Set<Tag> tags = new HashSet<>();

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL)
    @Builder.Default
    private List<QuizAttempt> attempts = new ArrayList<>();

    /**
     * Convenience method to check if quiz is published.
     */
    public boolean isPublished() {
        return status == QuizStatus.PUBLISHED;
    }

    /**
     * Check if quiz is currently available for taking.
     * Returns true if current time is within the availability window.
     * Null values mean no restriction on that bound.
     */
    public boolean isCurrentlyAvailable() {
        Instant now = Instant.now();
        if (availableFrom != null && now.isBefore(availableFrom)) {
            return false;
        }
        return availableUntil == null || !now.isAfter(availableUntil);
    }

    /**
     * Check if results are currently visible.
     * Returns true if resultsVisibleFrom is null or current time is after it.
     */
    public boolean areResultsVisible() {
        if (resultsVisibleFrom == null) {
            return true;
        }
        return Instant.now().isAfter(resultsVisibleFrom);
    }

    /**
     * Get the availability status for display purposes.
     */
    public QuizAvailabilityStatus getAvailabilityStatus() {
        Instant now = Instant.now();
        if (availableFrom != null && now.isBefore(availableFrom)) {
            return QuizAvailabilityStatus.SCHEDULED;
        }
        if (availableUntil != null && now.isAfter(availableUntil)) {
            return QuizAvailabilityStatus.CLOSED;
        }
        return QuizAvailabilityStatus.OPEN;
    }

    /**
     * Check if a given IP address is allowed for this quiz.
     * Returns true if IP filtering is disabled or IP is in allowed list.
     * Supports both individual IPs and CIDR notation.
     */
    public boolean isIpAllowed(String clientIp) {
        if (!filterIpAddresses || allowedIpAddresses == null || allowedIpAddresses.isBlank()) {
            return true;
        }
        return IpAddressUtil.isIpInAllowedList(clientIp, allowedIpAddresses);
    }
}
