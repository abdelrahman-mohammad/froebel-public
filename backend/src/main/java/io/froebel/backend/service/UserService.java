package io.froebel.backend.service;

import io.froebel.backend.exception.ResourceNotFoundException;
import io.froebel.backend.repository.PasswordResetTokenRepository;
import io.froebel.backend.repository.RefreshTokenRepository;
import io.froebel.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    public UserService(
        UserRepository userRepository,
        RefreshTokenRepository refreshTokenRepository,
        PasswordResetTokenRepository passwordResetTokenRepository
    ) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
    }

    @Transactional
    public void deleteUser(UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "id", userId);
        }

        // Delete refresh tokens (manual - no cascade configured)
        refreshTokenRepository.deleteByUserId(userId);

        // Delete password reset tokens (manual - no cascade configured)
        passwordResetTokenRepository.deleteByUserId(userId);

        // Delete user (courses, quizzes, questions cascade automatically)
        userRepository.deleteById(userId);
    }
}
