package com.giftgallery.backend.config;

import com.giftgallery.backend.model.User;
import com.giftgallery.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Runs once on every startup.
 * Ensures exactly ONE admin account exists in the database.
 *
 * Credentials come from application.yml under the "admin:" block:
 *   admin.name     → display name
 *   admin.email    → login email
 *   admin.password → plain-text password (stored BCrypt-hashed)
 *
 * Rules:
 *  1. If no ADMIN exists in DB → create one with the configured credentials.
 *  2. If an ADMIN already exists → do nothing (credentials are never reset on restart).
 *  3. The public /api/auth/register endpoint always assigns role = CUSTOMER,
 *     so no regular user can ever become admin through the UI.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.name}")
    private String adminName;

    @Value("${admin.email}")
    private String adminEmail;

    @Value("${admin.password}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        // Check if an admin account already exists
        userRepository.findByRole(User.Role.ADMIN).ifPresentOrElse(existingAdmin -> {
            // Admin exists — sync ALL credentials from config in case they changed in application.yml
            boolean passwordChanged = !passwordEncoder.matches(adminPassword, existingAdmin.getPassword());
            boolean nameChanged     = !adminName.equals(existingAdmin.getName());
            boolean emailChanged    = !adminEmail.equals(existingAdmin.getEmail());

            if (emailChanged && userRepository.existsByEmail(adminEmail)) {
                log.warn("⚠️  Cannot update admin email to '{}' — it is already taken by another account.", adminEmail);
            } else if (passwordChanged || nameChanged || emailChanged) {
                existingAdmin.setName(adminName);
                existingAdmin.setEmail(adminEmail);
                existingAdmin.setPassword(passwordEncoder.encode(adminPassword));
                userRepository.save(existingAdmin);
                log.info("🔄 Admin credentials updated from application.yml → email: {}", adminEmail);
            } else {
                log.info("✅ Admin account already exists and credentials are up-to-date.");
            }
        }, () -> {
            // No admin exists yet — check if the configured email is taken by a CUSTOMER
            if (userRepository.existsByEmail(adminEmail)) {
                log.warn("⚠️  Email '{}' is already registered as a CUSTOMER. " +
                         "To promote them: UPDATE users SET role='ADMIN' WHERE email='{}';",
                         adminEmail, adminEmail);
                return;
            }

            // Create the admin account
            User admin = User.builder()
                    .name(adminName)
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .role(User.Role.ADMIN)
                    .build();

            userRepository.save(admin);
            log.info("🎉 Admin account created → email: {} | Change credentials in application.yml", adminEmail);
        });
    }
}
