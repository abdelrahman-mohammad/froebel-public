package io.froebel.backend.search.dto;

import java.util.List;

public record SearchResultDTO(
    List<SearchQuizItem> quizzes,
    List<SearchCourseItem> courses,
    int totalQuizzes,
    int totalCourses
) {
}
