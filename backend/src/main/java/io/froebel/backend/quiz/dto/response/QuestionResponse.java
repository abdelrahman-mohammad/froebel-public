package io.froebel.backend.quiz.dto.response;

import io.froebel.backend.model.entity.Question;
import io.froebel.backend.model.enums.QuestionType;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record QuestionResponse(
    UUID id,
    String text,
    QuestionType type,
    Integer points,
    String chapter,
    String explanation,
    String hintCorrect,
    String hintWrong,
    String identifier,
    Map<String, Object> data,
    Integer questionOrder,
    Instant createdAt
) {
    public static QuestionResponse from(Question question) {
        return new QuestionResponse(
            question.getId(),
            question.getText(),
            question.getType(),
            question.getPoints(),
            question.getChapter(),
            question.getExplanation(),
            question.getHintCorrect(),
            question.getHintWrong(),
            question.getIdentifier(),
            question.getData(),
            question.getQuestionOrder(),
            question.getCreatedAt()
        );
    }
}
