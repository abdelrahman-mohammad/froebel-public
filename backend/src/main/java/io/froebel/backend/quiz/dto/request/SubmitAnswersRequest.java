package io.froebel.backend.quiz.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public record SubmitAnswersRequest(
    @NotNull(message = "Answers are required")
    @Valid
    List<AnswerSubmission> answers
) {
    public record AnswerSubmission(
        @NotNull(message = "Question ID is required")
        UUID questionId,

        @NotNull(message = "Answer data is required")
        Map<String, Object> answerData,

        Integer timeTakenSeconds
    ) {
    }
}
