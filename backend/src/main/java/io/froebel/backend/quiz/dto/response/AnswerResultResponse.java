package io.froebel.backend.quiz.dto.response;

import io.froebel.backend.model.enums.QuestionType;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public record AnswerResultResponse(
    UUID questionId,
    String questionText,
    QuestionType questionType,
    Integer questionPoints,
    Map<String, Object> userAnswer,
    Boolean isCorrect,
    Integer pointsEarned,
    Map<String, Object> correctAnswer,  // Only included if showCorrectAnswers is true
    String explanation,                  // Only included if showCorrectAnswers is true
    List<BlankResult> blankResults      // For FILL_IN_BLANK partial results
) {
    public record BlankResult(
        int index,
        String userAnswer,
        String correctAnswer,
        boolean isCorrect
    ) {
    }
}
