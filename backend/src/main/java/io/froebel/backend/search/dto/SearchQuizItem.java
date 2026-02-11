package io.froebel.backend.search.dto;

import io.froebel.backend.model.entity.Question;
import io.froebel.backend.model.entity.Quiz;
import io.froebel.backend.model.entity.Tag;
import io.froebel.backend.quiz.dto.QuizSnapshot;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

public record SearchQuizItem(
    UUID id,
    String title,
    String description,
    String creatorName,
    int questionCount,
    Integer timeLimit,
    Set<String> tags
) {
    public static SearchQuizItem from(Quiz quiz) {
        // Deduplicate questions by ID to handle Cartesian product from EntityGraph
        Set<UUID> seenIds = new HashSet<>();
        for (Question q : quiz.getQuestions()) {
            seenIds.add(q.getId());
        }

        return new SearchQuizItem(
            quiz.getId(),
            quiz.getTitle(),
            quiz.getDescription(),
            quiz.getCreator().getDisplayName(),
            seenIds.size(),
            quiz.getTimeLimit(),
            quiz.getTags().stream().map(Tag::getName).collect(Collectors.toSet())
        );
    }

    /**
     * Build a SearchQuizItem from a published snapshot.
     * Used to serve the frozen published version in search results.
     *
     * @param quiz     The quiz entity (for id, creator)
     * @param snapshot The published snapshot to serve
     */
    public static SearchQuizItem fromSnapshot(Quiz quiz, QuizSnapshot snapshot) {
        // Tags come from snapshot if available, otherwise from entity
        Set<String> tagNames = snapshot.tagNames() != null ? snapshot.tagNames() :
            quiz.getTags().stream().map(Tag::getName).collect(Collectors.toSet());

        return new SearchQuizItem(
            quiz.getId(),
            snapshot.title(),
            snapshot.description(),
            quiz.getCreator().getDisplayName(),
            snapshot.questions().size(),
            snapshot.settings().timeLimit(),
            tagNames
        );
    }
}
