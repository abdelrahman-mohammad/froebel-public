package io.froebel.backend.exception;

import io.froebel.backend.auth.exception.AuthenticationException;
import io.froebel.backend.auth.exception.EmailAlreadyExistsException;
import io.froebel.backend.auth.exception.EmailNotVerifiedException;
import io.froebel.backend.auth.exception.InvalidCredentialsException;
import io.froebel.backend.auth.exception.InvalidTokenException;
import io.froebel.backend.auth.exception.InvalidTwoFactorCodeException;
import io.froebel.backend.auth.exception.OAuth2AuthenticationException;
import io.froebel.backend.auth.exception.TokenExpiredException;
import io.froebel.backend.auth.exception.TwoFactorRequiredException;
import io.froebel.backend.course.exception.AlreadyEnrolledException;
import io.froebel.backend.course.exception.CourseAccessDeniedException;
import io.froebel.backend.course.exception.CourseNotPublishedException;
import io.froebel.backend.course.exception.MaterialNotFoundException;
import io.froebel.backend.course.exception.NotEnrolledException;
import io.froebel.backend.quiz.exception.AttemptLimitExceededException;
import io.froebel.backend.quiz.exception.InvalidAccessCodeException;
import io.froebel.backend.quiz.exception.InvalidQuestionDataException;
import io.froebel.backend.quiz.exception.IpNotAllowedException;
import io.froebel.backend.quiz.exception.QuizAccessDeniedException;
import io.froebel.backend.quiz.exception.QuizConflictException;
import io.froebel.backend.quiz.exception.QuizNotAvailableException;
import io.froebel.backend.quiz.exception.QuizNotPublishedException;
import io.froebel.backend.settings.exception.CannotUnlinkLastAuthMethodException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // ==================== Auth Exceptions ====================

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleEmailAlreadyExists(EmailAlreadyExistsException ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.CONFLICT.value(),
            ex.getMessage(),
            Instant.now()
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleInvalidCredentials(InvalidCredentialsException ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.UNAUTHORIZED.value(),
            ex.getMessage(),
            Instant.now()
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler(EmailNotVerifiedException.class)
    public ResponseEntity<ErrorResponse> handleEmailNotVerified(EmailNotVerifiedException ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.FORBIDDEN.value(),
            ex.getMessage(),
            Instant.now()
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    @ExceptionHandler(InvalidTokenException.class)
    public ResponseEntity<ErrorResponse> handleInvalidToken(InvalidTokenException ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.UNAUTHORIZED.value(),
            ex.getMessage(),
            Instant.now()
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler(TokenExpiredException.class)
    public ResponseEntity<ErrorResponse> handleTokenExpired(TokenExpiredException ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.UNAUTHORIZED.value(),
            ex.getMessage(),
            Instant.now()
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler(OAuth2AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleOAuth2AuthenticationException(OAuth2AuthenticationException ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.UNAUTHORIZED.value(),
            "OAuth2 authentication failed: " + ex.getMessage(),
            Instant.now()
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler(TwoFactorRequiredException.class)
    public ResponseEntity<ErrorResponse> handleTwoFactorRequired(TwoFactorRequiredException ex) {
        Map<String, String> details = new HashMap<>();
        details.put("code", "2FA_REQUIRED");
        ErrorResponse error = new ErrorResponse(
            HttpStatus.FORBIDDEN.value(),
            ex.getMessage(),
            Instant.now(),
            details
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    @ExceptionHandler(InvalidTwoFactorCodeException.class)
    public ResponseEntity<ErrorResponse> handleInvalidTwoFactorCode(InvalidTwoFactorCodeException ex) {
        Map<String, String> details = new HashMap<>();
        details.put("code", "INVALID_2FA_CODE");
        ErrorResponse error = new ErrorResponse(
            HttpStatus.UNAUTHORIZED.value(),
            ex.getMessage(),
            Instant.now(),
            details
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationException(AuthenticationException ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.UNAUTHORIZED.value(),
            ex.getMessage(),
            Instant.now()
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    // ==================== Settings Exceptions ====================

    @ExceptionHandler(CannotUnlinkLastAuthMethodException.class)
    public ResponseEntity<ErrorResponse> handleCannotUnlinkLastAuthMethod(CannotUnlinkLastAuthMethodException ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.CONFLICT.value(),
            ex.getMessage(),
            Instant.now()
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    // ==================== Quiz Exceptions ====================

    @ExceptionHandler(QuizAccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleQuizAccessDenied(QuizAccessDeniedException ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.FORBIDDEN.value(),
            ex.getMessage(),
            Instant.now()
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    @ExceptionHandler(QuizNotPublishedException.class)
    public ResponseEntity<ErrorResponse> handleQuizNotPublished(QuizNotPublishedException ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.NOT_FOUND.value(),
            ex.getMessage(),
            Instant.now()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(AttemptLimitExceededException.class)
    public ResponseEntity<ErrorResponse> handleAttemptLimitExceeded(AttemptLimitExceededException ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.TOO_MANY_REQUESTS.value(),
            ex.getMessage(),
            Instant.now()
        );
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(error);
    }

    @ExceptionHandler(InvalidQuestionDataException.class)
    public ResponseEntity<ErrorResponse> handleInvalidQuestionData(InvalidQuestionDataException ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.BAD_REQUEST.value(),
            ex.getMessage(),
            Instant.now()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(QuizNotAvailableException.class)
    public ResponseEntity<ErrorResponse> handleQuizNotAvailable(QuizNotAvailableException ex) {
        Map<String, String> details = new HashMap<>();
        if (ex.getAvailableFrom() != null) {
            details.put("availableFrom", ex.getAvailableFrom().toString());
        }
        if (ex.getAvailableUntil() != null) {
            details.put("availableUntil", ex.getAvailableUntil().toString());
        }
        ErrorResponse error = new ErrorResponse(
            HttpStatus.FORBIDDEN.value(),
            ex.getMessage(),
            Instant.now(),
            details.isEmpty() ? null : details
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    @ExceptionHandler(InvalidAccessCodeException.class)
    public ResponseEntity<ErrorResponse> handleInvalidAccessCode(InvalidAccessCodeException ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.FORBIDDEN.value(),
            ex.getMessage(),
            Instant.now()
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    @ExceptionHandler(IpNotAllowedException.class)
    public ResponseEntity<ErrorResponse> handleIpNotAllowed(IpNotAllowedException ex) {
        Map<String, String> details = new HashMap<>();
        details.put("clientIp", ex.getClientIp());
        ErrorResponse error = new ErrorResponse(
            HttpStatus.FORBIDDEN.value(),
            ex.getMessage(),
            Instant.now(),
            details
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    @ExceptionHandler({OptimisticLockingFailureException.class, QuizConflictException.class})
    public ResponseEntity<ErrorResponse> handleOptimisticLock(Exception ex) {
        Map<String, String> details = new HashMap<>();
        if (ex instanceof QuizConflictException conflictEx && conflictEx.getCurrentVersion() != null) {
            details.put("currentVersion", conflictEx.getCurrentVersion().toString());
        }
        ErrorResponse error = new ErrorResponse(
            HttpStatus.CONFLICT.value(),
            "This quiz was modified by another user. Please refresh and try again.",
            Instant.now(),
            details.isEmpty() ? null : details
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    // ==================== Course Exceptions ====================

    @ExceptionHandler(CourseAccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleCourseAccessDenied(CourseAccessDeniedException ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.FORBIDDEN.value(),
            ex.getMessage(),
            Instant.now()
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    @ExceptionHandler(CourseNotPublishedException.class)
    public ResponseEntity<ErrorResponse> handleCourseNotPublished(CourseNotPublishedException ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.NOT_FOUND.value(),
            ex.getMessage(),
            Instant.now()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(MaterialNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleMaterialNotFound(MaterialNotFoundException ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.NOT_FOUND.value(),
            ex.getMessage(),
            Instant.now()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(AlreadyEnrolledException.class)
    public ResponseEntity<ErrorResponse> handleAlreadyEnrolled(AlreadyEnrolledException ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.CONFLICT.value(),
            ex.getMessage(),
            Instant.now()
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    @ExceptionHandler(NotEnrolledException.class)
    public ResponseEntity<ErrorResponse> handleNotEnrolled(NotEnrolledException ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.FORBIDDEN.value(),
            ex.getMessage(),
            Instant.now()
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    // ==================== Other Exceptions ====================

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(ResourceNotFoundException ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.NOT_FOUND.value(),
            ex.getMessage(),
            Instant.now()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        ErrorResponse error = new ErrorResponse(
            HttpStatus.BAD_REQUEST.value(),
            "Validation failed",
            Instant.now(),
            errors
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "An unexpected error occurred",
            Instant.now()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    public record ErrorResponse(
        int status,
        String message,
        Instant timestamp,
        Map<String, String> errors
    ) {
        public ErrorResponse(int status, String message, Instant timestamp) {
            this(status, message, timestamp, null);
        }
    }
}
