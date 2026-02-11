package io.froebel.backend.auth.security;

import io.froebel.backend.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String userIdOrEmail) throws UsernameNotFoundException {
        // Try to parse as UUID first (for JWT auth)
        try {
            UUID userId = UUID.fromString(userIdOrEmail);
            return userRepository.findById(userId)
                .map(UserPrincipal::new)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + userId));
        } catch (IllegalArgumentException e) {
            // Fall back to email lookup (for login)
            return userRepository.findByEmail(userIdOrEmail)
                .map(UserPrincipal::new)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + userIdOrEmail));
        }
    }

    public UserDetails loadUserById(UUID userId) {
        return userRepository.findById(userId)
            .map(UserPrincipal::new)
            .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + userId));
    }
}
