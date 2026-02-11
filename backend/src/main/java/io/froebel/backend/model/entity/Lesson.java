package io.froebel.backend.model.entity;

import io.froebel.backend.model.enums.MaterialContentType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "lesson")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lesson extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "content_type")
    @Builder.Default
    private MaterialContentType contentType = MaterialContentType.TEXT;

    @Column(name = "file_id")
    private UUID fileId;

    @Column(nullable = false)
    @Builder.Default
    private Integer lessonOrder = 0;

    @Column
    private Integer durationMinutes;

    @Column(nullable = false)
    @Builder.Default
    private boolean published = false;

    @ManyToMany
    @JoinTable(
        name = "lesson_media",
        joinColumns = @JoinColumn(name = "lesson_id"),
        inverseJoinColumns = @JoinColumn(name = "media_id")
    )
    @Builder.Default
    private Set<Media> media = new HashSet<>();

    @OneToMany(mappedBy = "lesson")
    @Builder.Default
    private List<Quiz> quizzes = new ArrayList<>();
}
