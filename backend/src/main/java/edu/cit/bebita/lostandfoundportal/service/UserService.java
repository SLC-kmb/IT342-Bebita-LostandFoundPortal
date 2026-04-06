package edu.cit.bebita.lostandfoundportal.service;

import edu.cit.bebita.lostandfoundportal.adapter.EntityDtoAdapter;
import edu.cit.bebita.lostandfoundportal.dto.LoginRequest;
import edu.cit.bebita.lostandfoundportal.dto.RegisterRequest;
import edu.cit.bebita.lostandfoundportal.dto.UserResponse;
import edu.cit.bebita.lostandfoundportal.entity.User;
import edu.cit.bebita.lostandfoundportal.exception.DuplicateEmailException;
import edu.cit.bebita.lostandfoundportal.exception.InvalidCredentialsException;
import edu.cit.bebita.lostandfoundportal.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EntityDtoAdapter adapter;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, EntityDtoAdapter adapter) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adapter = adapter;
    }

    public UserResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new DuplicateEmailException("Email already registered");
        }

        User user = new User();
        user.setFirstName(request.getFirstname());
        user.setLastName(request.getLastname());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));

        userRepository.save(user);

        return adapter.adapt(user);
    }

    public User registerUser(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new DuplicateEmailException("Email already registered");
        }

        User user = new User();
        user.setFirstName(request.getFirstname());
        user.setLastName(request.getLastname());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));

        return userRepository.save(user);
    }

    public User authenticateUser(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid credentials");
        }

        return user;
    }

    public UserResponse login(LoginRequest request) {
        User user = authenticateUser(request);
        return adapter.adapt(user);
    }

    public UserResponse getUserProfile(User user) {
        return adapter.adapt(user);
    }
}
