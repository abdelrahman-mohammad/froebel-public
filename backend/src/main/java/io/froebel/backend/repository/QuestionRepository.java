package io.froebel.backend.repository;

import io.froebel.backend.model.entity.Question;
import io.froebel.backend.model.enums.QuestionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuestionRepository extends JpaRepository<Question, UUID> {

    List<Question> findByQuizId(UUID quizId);

    List<Question> findByQuizIdOrderByQuestionOrderAsc(UUID quizId);

    List<Question> findByQuizIdAndType(UUID quizId, QuestionType type);

    List<Question> findByQuizIdAndChapter(UUID quizId, String chapter);

    Optional<Question> findByIdAndQuizId(UUID id, UUID quizId);

    @Query("SELECT COALESCE(MAX(q.questionOrder), 0) FROM Question q WHERE q.quiz.id = :quizId")
    int findMaxQuestionOrderByQuizId(@Param("quizId") UUID quizId);

    long countByQuizId(UUID quizId);

    void deleteByQuizId(UUID quizId);

    List<Question> findByIdIn(Collection<UUID> ids);
}
