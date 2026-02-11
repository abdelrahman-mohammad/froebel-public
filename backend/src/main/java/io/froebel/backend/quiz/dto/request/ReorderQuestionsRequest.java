package io.froebel.backend.quiz.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

public record ReorderQuestionsRequest(
    @NotNull(message = "Question orders are required")
    @Size(min = 1, message = "At least one question order must be provided")
    @Valid
    List<QuestionOrderItem> questionOrders
) {
    public record QuestionOrderItem(
        @NotNull(message = "Question ID is required")
        UUID questionId,

        @NotNull(message = "Order is required")
        @Min(value = 0, message = "Order must be non-negative")
        Integer order
    ) {
    }
}
