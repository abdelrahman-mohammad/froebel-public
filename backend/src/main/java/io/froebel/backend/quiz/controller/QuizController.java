package io.froebel.backend.quiz.controller;

import io.froebel.backend.auth.security.UserPrincipal;
import io.froebel.backend.quiz.dto.request.CreateQuizRequest;
import io.froebel.backend.quiz.dto.request.ImportQuizRequest;
import io.froebel.backend.quiz.dto.request.UpdateQuizRequest;
import io.froebel.backend.quiz.dto.response.QuizDetailResponse;
import io.froebel.backend.quiz.dto.response.QuizExportResponse;
import io.froebel.backend.quiz.dto.response.QuizSummaryResponse;
import io.froebel.backend.quiz.service.QuizImportExportService;
import io.froebel.backend.quiz.service.QuizService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/quizzes")
public class QuizController {

    private final QuizService quizService;
    private final QuizImportExportService importExportService;

    public QuizController(QuizService quizService, QuizImportExportService importExportService) {
        this.quizService = quizService;
        this.importExportService = importExportService;
    }

    @PostMapping
    public ResponseEntity<QuizDetailResponse> createQuiz(
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody CreateQuizRequest request
    ) {
        QuizDetailResponse response = quizService.createQuiz(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<QuizSummaryResponse>> getMyQuizzes(
        @AuthenticationPrincipal UserPrincipal principal,
        @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(quizService.getUserQuizzes(principal.getId(), pageable));
    }

    @GetMapping("/{quizId}")
    public ResponseEntity<QuizDetailResponse> getQuiz(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable String quizId
    ) {
        return ResponseEntity.ok(quizService.getOwnedQuizDetailByShareableId(quizId, principal.getId()));
    }

    @PutMapping("/{quizId}")
    public ResponseEntity<QuizDetailResponse> updateQuiz(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable String quizId,
        @Valid @RequestBody UpdateQuizRequest request
    ) {
        return ResponseEntity.ok(quizService.updateQuizByShareableId(quizId, principal.getId(), request));
    }

    @DeleteMapping("/{quizId}")
    public ResponseEntity<Void> deleteQuiz(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable String quizId
    ) {
        quizService.deleteQuizByShareableId(quizId, principal.getId());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{quizId}/publish")
    public ResponseEntity<QuizDetailResponse> publishQuiz(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable String quizId,
        @RequestParam(defaultValue = "true") boolean publish
    ) {
        return ResponseEntity.ok(quizService.publishQuizByShareableId(quizId, principal.getId(), publish));
    }

    @PatchMapping("/{quizId}/update-published")
    public ResponseEntity<QuizDetailResponse> updatePublishedVersion(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable String quizId
    ) {
        return ResponseEntity.ok(quizService.updatePublishedVersionByShareableId(quizId, principal.getId()));
    }

    @GetMapping("/{quizId}/has-unpublished-changes")
    public ResponseEntity<java.util.Map<String, Boolean>> hasUnpublishedChanges(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable String quizId
    ) {
        boolean hasChanges = quizService.hasUnpublishedChangesByShareableId(quizId, principal.getId());
        return ResponseEntity.ok(java.util.Map.of("hasUnpublishedChanges", hasChanges));
    }

    @GetMapping("/public")
    public ResponseEntity<Page<QuizSummaryResponse>> getPublicQuizzes(
        @RequestParam(required = false) String search,
        @RequestParam(required = false) UUID categoryId,
        @RequestParam(required = false) Set<String> tags,
        @RequestParam(defaultValue = "newest") String sortBy,
        @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(quizService.getFilteredPublicQuizzes(
            search, categoryId, tags, sortBy, pageable));
    }

    @PostMapping("/import")
    public ResponseEntity<QuizDetailResponse> importQuiz(
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody ImportQuizRequest request
    ) {
        QuizDetailResponse response = importExportService.importQuiz(principal.getId(), request.quizData());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{quizId}/export")
    public ResponseEntity<QuizExportResponse> exportQuiz(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable String quizId,
        @RequestParam(defaultValue = "true") boolean includeAnswers
    ) {
        return ResponseEntity.ok(importExportService.exportQuizByShareableId(quizId, principal.getId(), includeAnswers));
    }
}
