package io.froebel.backend.quiz.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record StartAttemptRequest(
    @Size(max = 100, message = "Name must be at most 100 characters")
    String anonymousName,

    @Email(message = "Invalid email format")
    @Size(max = 255, message = "Email must be at most 255 characters")
    String anonymousEmail,

    @Size(max = 20, message = "Access code must be at most 20 characters")
    String accessCode,

    @Size(max = 36, message = "Session ID must be at most 36 characters")
    String anonymousSessionId
) {
}
