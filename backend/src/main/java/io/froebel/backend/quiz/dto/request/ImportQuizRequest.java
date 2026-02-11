package io.froebel.backend.quiz.dto.request;

import jakarta.validation.constraints.NotNull;

import java.util.Map;

public record ImportQuizRequest(
    @NotNull(message = "Quiz data is required")
    Map<String, Object> quizData
) {
}
