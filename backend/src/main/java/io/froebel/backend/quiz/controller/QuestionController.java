package io.froebel.backend.quiz.controller;

import io.froebel.backend.auth.security.UserPrincipal;
import io.froebel.backend.quiz.dto.request.CreateQuestionRequest;
import io.froebel.backend.quiz.dto.request.ReorderQuestionsRequest;
import io.froebel.backend.quiz.dto.request.UpdateQuestionRequest;
import io.froebel.backend.quiz.dto.response.QuestionResponse;
import io.froebel.backend.quiz.service.QuestionService;
import jakarta.validation.Valid;
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
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/quizzes/{quizId}/questions")
public class QuestionController {

    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @PostMapping
    public ResponseEntity<QuestionResponse> addQuestion(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable String quizId,
        @Valid @RequestBody CreateQuestionRequest request
    ) {
        QuestionResponse response = questionService.addQuestionByShareableId(quizId, principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<QuestionResponse>> getQuestions(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable String quizId
    ) {
        return ResponseEntity.ok(questionService.getQuestionsByShareableId(quizId, principal.getId()));
    }

    @GetMapping("/{questionId}")
    public ResponseEntity<QuestionResponse> getQuestion(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable String quizId,
        @PathVariable UUID questionId
    ) {
        return ResponseEntity.ok(questionService.getQuestionByShareableId(quizId, questionId, principal.getId()));
    }

    @PutMapping("/{questionId}")
    public ResponseEntity<QuestionResponse> updateQuestion(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable String quizId,
        @PathVariable UUID questionId,
        @Valid @RequestBody UpdateQuestionRequest request
    ) {
        return ResponseEntity.ok(questionService.updateQuestionByShareableId(quizId, questionId, principal.getId(), request));
    }

    @DeleteMapping("/{questionId}")
    public ResponseEntity<Void> deleteQuestion(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable String quizId,
        @PathVariable UUID questionId
    ) {
        questionService.deleteQuestionByShareableId(quizId, questionId, principal.getId());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/reorder")
    public ResponseEntity<List<QuestionResponse>> reorderQuestions(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable String quizId,
        @Valid @RequestBody ReorderQuestionsRequest request
    ) {
        return ResponseEntity.ok(questionService.reorderQuestionsByShareableId(quizId, principal.getId(), request));
    }
}
