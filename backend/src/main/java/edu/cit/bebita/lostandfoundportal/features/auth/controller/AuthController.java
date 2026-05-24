package edu.cit.bebita.lostandfoundportal.features.auth.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.cit.bebita.lostandfoundportal.features.auth.dto.AuthResponse;
import edu.cit.bebita.lostandfoundportal.features.auth.dto.GoogleAuthRequest;
import edu.cit.bebita.lostandfoundportal.features.auth.dto.LoginRequest;
import edu.cit.bebita.lostandfoundportal.features.auth.dto.RegisterRequest;
import edu.cit.bebita.lostandfoundportal.features.auth.service.UserService;
import edu.cit.bebita.lostandfoundportal.shared.api.ApiResponse;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = userService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = userService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<AuthResponse>> googleLogin(@Valid @RequestBody GoogleAuthRequest request) {
        AuthResponse response = userService.googleLogin(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/verify-email")
    public ResponseEntity<ApiResponse<String>> verifyEmail(@RequestParam String token) {
        userService.verifyEmail(token);
        return ResponseEntity.ok(ApiResponse.success("Email verified successfully. You can now login."));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<ApiResponse<String>> resendVerification(@RequestBody java.util.Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error(new edu.cit.bebita.lostandfoundportal.shared.api.ApiError("VALID-001", "Email is required", null)));
        }
        userService.resendVerificationEmail(email);
        return ResponseEntity.ok(ApiResponse.success("Verification email resent successfully."));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@RequestBody java.util.Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error(new edu.cit.bebita.lostandfoundportal.shared.api.ApiError("VALID-001", "Email is required", null)));
        }
        userService.forgotPassword(email);
        return ResponseEntity.ok(ApiResponse.success("Password reset email sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@RequestBody java.util.Map<String, String> body) {
        String token = body.get("token");
        String newPassword = body.get("newPassword");
        if (token == null || token.isBlank() || newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error(new edu.cit.bebita.lostandfoundportal.shared.api.ApiError("VALID-001", "Token and new password are required", null)));
        }
        userService.resetPassword(token, newPassword);
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully. You can now login."));
    }
}

