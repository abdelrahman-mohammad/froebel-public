package io.froebel.backend.quiz.controller;

import io.froebel.backend.auth.security.UserPrincipal;
import io.froebel.backend.quiz.dto.response.QuizAnalyticsResponse;
import io.froebel.backend.quiz.dto.response.QuizAnalyticsSummaryResponse;
import io.froebel.backend.quiz.service.QuizAnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/quizzes/{quizId}/analytics")
public class QuizAnalyticsController {

    private final QuizAnalyticsService analyticsService;

    public QuizAnalyticsController(QuizAnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    /**
     * Get full analytics for a quiz.
     * Only accessible by quiz owner.
     */
    @GetMapping
    public ResponseEntity<QuizAnalyticsResponse> getQuizAnalytics(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID quizId,
        @RequestParam(defaultValue = "30") int days
    ) {
        return ResponseEntity.ok(
            analyticsService.getQuizAnalytics(quizId, principal.getId(), days)
        );
    }

    /**
     * Get summary analytics (lighter payload).
     * Only accessible by quiz owner.
     */
    @GetMapping("/summary")
    public ResponseEntity<QuizAnalyticsSummaryResponse> getQuizAnalyticsSummary(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID quizId
    ) {
        return ResponseEntity.ok(
            analyticsService.getQuizAnalyticsSummary(quizId, principal.getId())
        );
    }
}
