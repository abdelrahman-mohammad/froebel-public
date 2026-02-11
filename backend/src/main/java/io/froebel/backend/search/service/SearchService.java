package io.froebel.backend.search.service;

import io.froebel.backend.model.entity.Quiz;
import io.froebel.backend.model.entity.QuizHistory;
import io.froebel.backend.model.enums.QuizStatus;
import io.froebel.backend.quiz.dto.QuizSnapshot;
import io.froebel.backend.repository.CourseRepository;
import io.froebel.backend.repository.QuizHistoryRepository;
import io.froebel.backend.repository.QuizRepository;
import io.froebel.backend.search.dto.SearchCourseItem;
import io.froebel.backend.search.dto.SearchQuizItem;
import io.froebel.backend.search.dto.SearchResultDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SearchService {

    private final QuizRepository quizRepository;
    private final QuizHistoryRepository quizHistoryRepository;
    private final CourseRepository courseRepository;

    public SearchService(
        QuizRepository quizRepository,
        QuizHistoryRepository quizHistoryRepository,
        CourseRepository courseRepository) {
        this.quizRepository = quizRepository;
        this.quizHistoryRepository = quizHistoryRepository;
        this.courseRepository = courseRepository;
    }

    /**
     * Quick search for dropdown preview (limited results)
     */
    public SearchResultDTO quickSearch(String query, int limit) {
        Pageable pageable = PageRequest.of(0, limit);

        var quizPage = quizRepository.searchPublicQuizzes(QuizStatus.PUBLISHED, query, pageable);
        var coursePage = courseRepository.searchPublishedCourses(query, pageable);

        // Map quizzes with published snapshots
        List<SearchQuizItem> quizItems = mapQuizzesWithSnapshots(quizPage.getContent());

        return new SearchResultDTO(
            quizItems,
            coursePage.getContent().stream().map(SearchCourseItem::from).toList(),
            (int) quizPage.getTotalElements(),
            (int) coursePage.getTotalElements()
        );
    }

    /**
     * Full paginated search for quizzes
     */
    public Page<SearchQuizItem> searchQuizzes(String query, Pageable pageable) {
        Page<Quiz> quizPage = quizRepository.searchPublicQuizzes(QuizStatus.PUBLISHED, query, pageable);

        // Batch fetch published snapshots
        Map<UUID, QuizSnapshot> snapshotMap = fetchSnapshotsForQuizzes(quizPage.getContent());

        // Map with snapshot when available, fallback to live entity
        return quizPage.map(quiz -> {
            QuizSnapshot snapshot = snapshotMap.get(quiz.getId());
            if (snapshot != null) {
                return SearchQuizItem.fromSnapshot(quiz, snapshot);
            }
            return SearchQuizItem.from(quiz);  // Legacy fallback
        });
    }

    /**
     * Full paginated search for courses
     */
    public Page<SearchCourseItem> searchCourses(String query, Pageable pageable) {
        return courseRepository.searchPublishedCourses(query, pageable)
            .map(SearchCourseItem::from);
    }

    /**
     * Map a list of quizzes to SearchQuizItem using published snapshots when available.
     */
    private List<SearchQuizItem> mapQuizzesWithSnapshots(List<Quiz> quizzes) {
        Map<UUID, QuizSnapshot> snapshotMap = fetchSnapshotsForQuizzes(quizzes);

        return quizzes.stream()
            .map(quiz -> {
                QuizSnapshot snapshot = snapshotMap.get(quiz.getId());
                if (snapshot != null) {
                    return SearchQuizItem.fromSnapshot(quiz, snapshot);
                }
                return SearchQuizItem.from(quiz);  // Legacy fallback
            })
            .toList();
    }

    /**
     * Batch fetch published snapshots for a list of quizzes.
     */
    private Map<UUID, QuizSnapshot> fetchSnapshotsForQuizzes(List<Quiz> quizzes) {
        Set<UUID> quizIdsWithPublishedVersion = quizzes.stream()
            .filter(q -> q.getPublishedVersionNumber() != null)
            .map(Quiz::getId)
            .collect(Collectors.toSet());

        if (quizIdsWithPublishedVersion.isEmpty()) {
            return Collections.emptyMap();
        }

        return quizHistoryRepository
            .findPublishedSnapshotsByQuizIds(quizIdsWithPublishedVersion)
            .stream()
            .collect(Collectors.toMap(h -> h.getQuiz().getId(), QuizHistory::getSnapshot));
    }
}
