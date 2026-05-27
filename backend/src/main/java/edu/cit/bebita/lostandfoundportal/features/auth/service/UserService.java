package edu.cit.bebita.lostandfoundportal.features.auth.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import edu.cit.bebita.lostandfoundportal.features.auth.dto.AuthResponse;
import edu.cit.bebita.lostandfoundportal.features.auth.dto.GoogleAuthRequest;
import edu.cit.bebita.lostandfoundportal.features.auth.dto.LoginRequest;
import edu.cit.bebita.lostandfoundportal.features.auth.dto.RegisterRequest;
import edu.cit.bebita.lostandfoundportal.features.auth.dto.UserResponse;
import edu.cit.bebita.lostandfoundportal.features.auth.model.User;
import edu.cit.bebita.lostandfoundportal.features.auth.repository.UserRepository;
import edu.cit.bebita.lostandfoundportal.shared.exception.DuplicateEmailException;
import edu.cit.bebita.lostandfoundportal.shared.exception.InvalidCredentialsException;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

import org.springframework.beans.factory.annotation.Value;
import java.util.Collections;
import java.util.UUID;
import java.time.LocalDateTime;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    @Value("${google.client.id}")
    private String googleClientId;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService, AuthenticationManager authenticationManager, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.emailService = emailService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new DuplicateEmailException("Email already registered");
        }

        User user = new User();
        user.setFirstName(request.getFirstname());
        user.setLastName(request.getLastname());
        user.setStudentId(request.getStudentId());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER");
        user.setAuthProvider("LOCAL");
        user.setEmailVerified(false);
        user.setEmailVerificationToken(UUID.randomUUID().toString());

        userRepository.save(user);
        
        emailService.sendVerificationEmail(user.getEmail(), user.getEmailVerificationToken(), user.getFirstName(), user.getLastName(), user.getStudentId());

        // We do not return a token here anymore because they need to verify first
        return new AuthResponse(null, new UserResponse(user.getEmail(), user.getFirstName(), user.getLastName(), user.getStudentId(), user.getRole()));
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Email not included"));

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (org.springframework.security.core.AuthenticationException e) {
            throw new InvalidCredentialsException("Incorrect password, try again");
        }
                
        // Block unverified non-admin users
        if (!user.isEmailVerified() && !"ADMIN".equals(user.getRole())) {
            throw new InvalidCredentialsException("Please check your email to verify your account before logging in.");
        }

        String jwtToken = jwtService.generateToken(user);
        UserResponse userResponse = new UserResponse(user.getEmail(), user.getFirstName(), user.getLastName(), user.getStudentId(), user.getRole());
        return new AuthResponse(jwtToken, userResponse);
    }

    public AuthResponse googleLogin(GoogleAuthRequest request) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(googleClientId))
                .build();

            GoogleIdToken idToken = verifier.verify(request.getIdToken());
            if (idToken == null) {
                throw new InvalidCredentialsException("Invalid Google ID token.");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String firstName = (String) payload.get("given_name");
            String lastName = (String) payload.get("family_name");

            User user = userRepository.findByEmail(email).orElseGet(() -> {
                User newUser = new User();
                newUser.setEmail(email);
                newUser.setFirstName(firstName != null ? firstName : "Unknown");
                newUser.setLastName(lastName != null ? lastName : "User");
                newUser.setRole("USER");
                newUser.setAuthProvider("GOOGLE");
                newUser.setEmailVerified(true); // Google emails are implicitly verified
                newUser.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString())); // Random password
                return userRepository.save(newUser);
            });

            String jwtToken = jwtService.generateToken(user);
            UserResponse userResponse = new UserResponse(user.getEmail(), user.getFirstName(), user.getLastName(), user.getStudentId(), user.getRole());
            return new AuthResponse(jwtToken, userResponse);

        } catch (Exception e) {
            throw new InvalidCredentialsException("Failed to verify Google token: " + e.getMessage());
        }
    }

    public void verifyEmail(String token) {
        User user = userRepository.findByEmailVerificationToken(token)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid or expired verification token"));
                
        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        userRepository.save(user);
    }

    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));

        if (user.isEmailVerified()) {
            throw new InvalidCredentialsException("Email is already verified");
        }

        user.setEmailVerificationToken(UUID.randomUUID().toString());
        userRepository.save(user);

        emailService.sendVerificationEmail(user.getEmail(), user.getEmailVerificationToken(), user.getFirstName(), user.getLastName(), user.getStudentId());
    }

    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));

        user.setResetPasswordToken(UUID.randomUUID().toString());
        user.setResetPasswordTokenExpiry(LocalDateTime.now().plusHours(1));
        userRepository.save(user);

        emailService.sendPasswordResetEmail(user.getEmail(), user.getResetPasswordToken(), user.getFirstName());
    }

    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetPasswordToken(token)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid reset token"));

        if (user.getResetPasswordTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new InvalidCredentialsException("Reset token has expired");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiry(null);
        userRepository.save(user);
    }
}

