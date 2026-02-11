package io.froebel.backend.course.controller;

import io.froebel.backend.auth.security.UserPrincipal;
import io.froebel.backend.course.dto.request.CreateMaterialRequest;
import io.froebel.backend.course.dto.request.ReorderMaterialsRequest;
import io.froebel.backend.course.dto.request.UpdateMaterialRequest;
import io.froebel.backend.course.dto.response.MaterialResponse;
import io.froebel.backend.course.service.MaterialService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/courses/{courseId}/materials")
public class MaterialController {

    private final MaterialService materialService;

    public MaterialController(MaterialService materialService) {
        this.materialService = materialService;
    }

    @PostMapping
    public ResponseEntity<MaterialResponse> addMaterial(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID courseId,
        @Valid @RequestBody CreateMaterialRequest request
    ) {
        MaterialResponse response = materialService.addMaterial(courseId, principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<MaterialResponse>> getMaterials(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID courseId
    ) {
        return ResponseEntity.ok(materialService.getMaterials(courseId, principal.getId()));
    }

    @GetMapping("/{materialId}")
    public ResponseEntity<MaterialResponse> getMaterial(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID courseId,
        @PathVariable UUID materialId
    ) {
        return ResponseEntity.ok(materialService.getMaterial(courseId, materialId, principal.getId()));
    }

    @PutMapping("/{materialId}")
    public ResponseEntity<MaterialResponse> updateMaterial(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID courseId,
        @PathVariable UUID materialId,
        @Valid @RequestBody UpdateMaterialRequest request
    ) {
        return ResponseEntity.ok(materialService.updateMaterial(courseId, materialId, principal.getId(), request));
    }

    @DeleteMapping("/{materialId}")
    public ResponseEntity<Void> deleteMaterial(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID courseId,
        @PathVariable UUID materialId
    ) {
        materialService.deleteMaterial(courseId, materialId, principal.getId());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/reorder")
    public ResponseEntity<List<MaterialResponse>> reorderMaterials(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID courseId,
        @Valid @RequestBody ReorderMaterialsRequest request
    ) {
        return ResponseEntity.ok(materialService.reorderMaterials(courseId, principal.getId(), request));
    }

    @PatchMapping("/{materialId}/publish")
    public ResponseEntity<MaterialResponse> publishMaterial(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID courseId,
        @PathVariable UUID materialId,
        @RequestParam boolean publish
    ) {
        return ResponseEntity.ok(materialService.publishMaterial(courseId, materialId, principal.getId(), publish));
    }

    // ==================== Quiz Association ====================

    @PostMapping("/{materialId}/quizzes/{quizId}")
    public ResponseEntity<MaterialResponse> attachQuiz(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID courseId,
        @PathVariable UUID materialId,
        @PathVariable UUID quizId
    ) {
        return ResponseEntity.ok(materialService.attachQuizToMaterial(courseId, materialId, quizId, principal.getId()));
    }

    @DeleteMapping("/{materialId}/quizzes/{quizId}")
    public ResponseEntity<MaterialResponse> detachQuiz(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID courseId,
        @PathVariable UUID materialId,
        @PathVariable UUID quizId
    ) {
        return ResponseEntity.ok(materialService.detachQuizFromMaterial(courseId, materialId, quizId, principal.getId()));
    }
}
