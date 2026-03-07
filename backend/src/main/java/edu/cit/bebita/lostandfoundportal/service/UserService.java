package edu.cit.bebita.lostandfoundportal.service;

import edu.cit.bebita.lostandfoundportal.dto.AuthResponse;
import edu.cit.bebita.lostandfoundportal.dto.LoginRequest;
import edu.cit.bebita.lostandfoundportal.dto.RegisterRequest;
import edu.cit.bebita.lostandfoundportal.dto.UserResponse;
import edu.cit.bebita.lostandfoundportal.entity.User;
import edu.cit.bebita.lostandfoundportal.exception.DuplicateEmailException;
import edu.cit.bebita.lostandfoundportal.exception.InvalidCredentialsException;
import edu.cit.bebita.lostandfoundportal.repository.UserRepository;
import edu.cit.bebita.lostandfoundportal.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new DuplicateEmailException("Email already registered");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstname());
        user.setLastName(request.getLastname());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole("ROLE_USER");
        user.setAuthProvider("LOCAL");

        userRepository.save(user);

        String accessToken = jwtService.generateAccessToken(user.getEmail());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());

        UserResponse userResponse = new UserResponse(
                user.getEmail(), user.getFirstName(), user.getLastName(), user.getRole()
        );

        return new AuthResponse(userResponse, accessToken, refreshToken);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid credentials");
        }

        String accessToken = jwtService.generateAccessToken(user.getEmail());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());

        UserResponse userResponse = new UserResponse(
                user.getEmail(), user.getFirstName(), user.getLastName(), user.getRole()
        );

        return new AuthResponse(userResponse, accessToken, refreshToken);
    }
}
