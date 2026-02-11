package io.froebel.backend.quiz.dto.request;

import io.froebel.backend.model.enums.QuestionType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.Map;

public record UpdateQuestionRequest(
    @NotBlank(message = "Question text is required")
    @Size(max = 5000, message = "Question text must be at most 5000 characters")
    String text,

    @NotNull(message = "Question type is required")
    QuestionType type,

    @Min(value = 1, message = "Points must be at least 1")
    @Max(value = 100, message = "Points cannot exceed 100")
    Integer points,

    @Size(max = 100, message = "Chapter must be at most 100 characters")
    String chapter,

    @Size(max = 2000, message = "Explanation must be at most 2000 characters")
    String explanation,

    @Size(max = 2000, message = "Correct hint must be at most 2000 characters")
    String hintCorrect,

    @Size(max = 2000, message = "Wrong hint must be at most 2000 characters")
    String hintWrong,

    @Size(max = 100, message = "Identifier must be at most 100 characters")
    String identifier,

    @NotNull(message = "Question data is required")
    Map<String, Object> data
) {
}
