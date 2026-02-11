package io.froebel.backend.quiz.controller;

import io.froebel.backend.auth.security.UserPrincipal;
import io.froebel.backend.quiz.dto.request.StartAttemptRequest;
import io.froebel.backend.quiz.dto.request.SubmitAnswersRequest;
import io.froebel.backend.quiz.dto.response.AttemptResponse;
import io.froebel.backend.quiz.dto.response.AttemptResultResponse;
import io.froebel.backend.quiz.dto.response.PublicQuizResponse;
import io.froebel.backend.quiz.service.QuizTakingService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/quizzes")
public class QuizTakingController {

    private final QuizTakingService quizTakingService;

    public QuizTakingController(QuizTakingService quizTakingService) {
        this.quizTakingService = quizTakingService;
    }

    @GetMapping("/public/{quizId}")
    public ResponseEntity<PublicQuizResponse> getPublicQuiz(
        @PathVariable String quizId,
        @RequestParam(required = false) String accessCode
    ) {
        return ResponseEntity.ok(quizTakingService.getPublicQuizByShareableId(quizId, accessCode));
    }

    @PostMapping("/{quizId}/attempts")
    public ResponseEntity<AttemptResponse> startAttempt(
        @PathVariable String quizId,
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody(required = false) StartAttemptRequest request,
        @RequestHeader(value = "X-Anonymous-Session-Id", required = false) String sessionIdHeader,
        HttpServletRequest httpRequest
    ) {
        UUID userId = principal != null ? principal.getId() : null;
        String ipAddress = getClientIpAddress(httpRequest);

        // Use session ID from header if not in request body
        String sessionId = null;
        if (request != null && request.anonymousSessionId() != null) {
            sessionId = request.anonymousSessionId();
        } else if (sessionIdHeader != null && !sessionIdHeader.isBlank()) {
            sessionId = sessionIdHeader;
        }

        if (request == null) {
            request = new StartAttemptRequest(null, null, null, sessionId);
        } else if (request.anonymousSessionId() == null && sessionId != null) {
            // Copy request with session ID from header
            request = new StartAttemptRequest(
                request.anonymousName(),
                request.anonymousEmail(),
                request.accessCode(),
                sessionId
            );
        }

        AttemptResponse response = quizTakingService.startAttemptByShareableId(quizId, userId, ipAddress, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/{quizId}/attempts/{attemptId}/submit")
    public ResponseEntity<AttemptResultResponse> submitAnswers(
        @PathVariable String quizId,
        @PathVariable UUID attemptId,
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody SubmitAnswersRequest request,
        @RequestHeader(value = "X-Anonymous-Session-Id", required = false) String sessionId,
        HttpServletRequest httpRequest
    ) {
        UUID userId = principal != null ? principal.getId() : null;
        String ipAddress = getClientIpAddress(httpRequest);

        AttemptResultResponse response = quizTakingService.submitAnswersByShareableId(
            quizId, attemptId, userId, ipAddress, sessionId, request
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{quizId}/attempts/{attemptId}")
    public ResponseEntity<AttemptResultResponse> getAttemptResult(
        @PathVariable String quizId,
        @PathVariable UUID attemptId,
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestHeader(value = "X-Anonymous-Session-Id", required = false) String sessionId,
        HttpServletRequest httpRequest
    ) {
        UUID userId = principal != null ? principal.getId() : null;
        String ipAddress = getClientIpAddress(httpRequest);

        AttemptResultResponse response = quizTakingService.getAttemptResultByShareableId(
            quizId, attemptId, userId, ipAddress, sessionId
        );
        return ResponseEntity.ok(response);
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            // Take the first IP in the chain (original client)
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }
}
