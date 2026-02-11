package io.froebel.backend.profile.dto;

public record ProfileStatsResponse(
    int quizzesCreated,
    int coursesCreated,
    int quizzesTaken
) {
}
