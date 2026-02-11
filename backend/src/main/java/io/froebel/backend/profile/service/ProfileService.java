package io.froebel.backend.profile.service;

import io.froebel.backend.exception.ResourceNotFoundException;
import io.froebel.backend.model.entity.User;
import io.froebel.backend.profile.dto.ProfileResponse;
import io.froebel.backend.profile.dto.ProfileStatsResponse;
import io.froebel.backend.profile.dto.PublicProfileResponse;
import io.froebel.backend.profile.dto.UpdatePrivacyRequest;
import io.froebel.backend.profile.dto.UpdateProfileRequest;
import io.froebel.backend.repository.CourseRepository;
import io.froebel.backend.repository.QuizAttemptRepository;
import io.froebel.backend.repository.QuizRepository;
import io.froebel.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class ProfileService {

    private final UserRepository userRepository;
    private final QuizRepository quizRepository;
    private final CourseRepository courseRepository;
    private final QuizAttemptRepository quizAttemptRepository;

    public ProfileService(
        UserRepository userRepository,
        QuizRepository quizRepository,
        CourseRepository courseRepository,
        QuizAttemptRepository quizAttemptRepository
    ) {
        this.userRepository = userRepository;
        this.quizRepository = quizRepository;
        this.courseRepository = courseRepository;
        this.quizAttemptRepository = quizAttemptRepository;
    }

    public ProfileResponse getProfile(UUID userId) {
        User user = findUserById(userId);
        ProfileStatsResponse stats = calculateStats(userId);
        return ProfileResponse.from(user, stats);
    }

    @Transactional
    public ProfileResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = findUserById(userId);

        user.setDisplayName(request.displayName());
        user.setFullName(request.fullName());
        user.setBio(request.bio());
        user.setLocation(request.location());
        user.setWebsite(request.website());

        if (request.avatarUrl() != null) {
            user.setAvatarUrl(request.avatarUrl());
        }

        if (request.socialLinks() != null) {
            user.setSocialLinks(request.socialLinks());
        }

        user = userRepository.save(user);
        ProfileStatsResponse stats = calculateStats(userId);
        return ProfileResponse.from(user, stats);
    }

    @Transactional
    public ProfileResponse updatePrivacy(UUID userId, UpdatePrivacyRequest request) {
        User user = findUserById(userId);

        user.setProfilePublic(request.profilePublic());
        user.setShowEmail(request.showEmail());
        user.setShowStats(request.showStats());

        user = userRepository.save(user);
        ProfileStatsResponse stats = calculateStats(userId);
        return ProfileResponse.from(user, stats);
    }

    public PublicProfileResponse getPublicProfile(UUID userId) {
        User user = findUserById(userId);

        if (!user.isProfilePublic()) {
            throw new ResourceNotFoundException("Profile", "id", userId);
        }

        ProfileStatsResponse stats = calculateStats(userId);
        return PublicProfileResponse.from(user, stats);
    }

    @Transactional
    public ProfileResponse updateAvatar(UUID userId, String avatarUrl) {
        User user = findUserById(userId);
        user.setAvatarUrl(avatarUrl);
        user = userRepository.save(user);
        ProfileStatsResponse stats = calculateStats(userId);
        return ProfileResponse.from(user, stats);
    }

    @Transactional
    public ProfileResponse deleteAvatar(UUID userId) {
        User user = findUserById(userId);
        user.setAvatarUrl(null);
        user = userRepository.save(user);
        ProfileStatsResponse stats = calculateStats(userId);
        return ProfileResponse.from(user, stats);
    }

    private User findUserById(UUID userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }

    private ProfileStatsResponse calculateStats(UUID userId) {
        int quizzesCreated = (int) quizRepository.countByCreatorId(userId);
        int coursesCreated = (int) courseRepository.countByCreatorId(userId);
        int quizzesTaken = (int) quizAttemptRepository.countByUserIdAndCompletedAtIsNotNull(userId);

        return new ProfileStatsResponse(quizzesCreated, coursesCreated, quizzesTaken);
    }
}
