package edu.cit.bebita.lostandfoundportal.controller;

import edu.cit.bebita.lostandfoundportal.dto.ApiResponse;
import edu.cit.bebita.lostandfoundportal.dto.LoginRequest;
import edu.cit.bebita.lostandfoundportal.dto.RegisterRequest;
import edu.cit.bebita.lostandfoundportal.dto.UserResponse;
import edu.cit.bebita.lostandfoundportal.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody RegisterRequest request) {
        UserResponse user = userService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(user));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<UserResponse>> login(@Valid @RequestBody LoginRequest request) {
        UserResponse user = userService.login(request);
        return ResponseEntity.ok(ApiResponse.success(user));
    }
}
