package io.froebel.backend.search.controller;

import io.froebel.backend.search.dto.SearchCourseItem;
import io.froebel.backend.search.dto.SearchQuizItem;
import io.froebel.backend.search.dto.SearchResultDTO;
import io.froebel.backend.search.service.SearchService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/search")
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    /**
     * Quick search for header dropdown preview
     * GET /api/v1/search?q=query&limit=5
     */
    @GetMapping
    public ResponseEntity<SearchResultDTO> quickSearch(
        @RequestParam("q") String query,
        @RequestParam(defaultValue = "5") int limit
    ) {
        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.ok(new SearchResultDTO(List.of(), List.of(), 0, 0));
        }
        return ResponseEntity.ok(searchService.quickSearch(query.trim(), Math.min(limit, 10)));
    }

    /**
     * Full quiz search for /search page
     * GET /api/v1/search/quizzes?q=query&page=0&size=12
     */
    @GetMapping("/quizzes")
    public ResponseEntity<Page<SearchQuizItem>> searchQuizzes(
        @RequestParam("q") String query,
        @PageableDefault(size = 12, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.ok(Page.empty(pageable));
        }
        return ResponseEntity.ok(searchService.searchQuizzes(query.trim(), pageable));
    }

    /**
     * Full course search for /search page
     * GET /api/v1/search/courses?q=query&page=0&size=12
     */
    @GetMapping("/courses")
    public ResponseEntity<Page<SearchCourseItem>> searchCourses(
        @RequestParam("q") String query,
        @PageableDefault(size = 12, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.ok(Page.empty(pageable));
        }
        return ResponseEntity.ok(searchService.searchCourses(query.trim(), pageable));
    }
}
