package edu.cit.bebita.lostandfoundportal.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import edu.cit.bebita.lostandfoundportal.features.auth.model.User;
import edu.cit.bebita.lostandfoundportal.features.auth.repository.UserRepository;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initDatabase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Check if an admin user already exists
            if (userRepository.findByEmail("admin@university.edu").isEmpty()) {
                User adminUser = new User();
                adminUser.setFirstName("System");
                adminUser.setLastName("Administrator");
                adminUser.setEmail("admin@university.edu");
                adminUser.setPasswordHash(passwordEncoder.encode("admin123")); // Default password
                adminUser.setRole("ADMIN");
                adminUser.setAuthProvider("LOCAL");

                userRepository.save(adminUser);
                System.out.println("=================================================");
                System.out.println("Default Admin Account Created!");
                System.out.println("Email: admin@university.edu");
                System.out.println("Password: admin123");
                System.out.println("=================================================");
            }
        };
    }
}
