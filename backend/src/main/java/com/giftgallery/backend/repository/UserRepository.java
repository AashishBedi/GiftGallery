package com.giftgallery.backend.repository;

import com.giftgallery.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByRole(User.Role role);
    boolean existsByEmail(String email);
    boolean existsByRole(User.Role role);
}