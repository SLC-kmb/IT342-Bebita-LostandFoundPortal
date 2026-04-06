package edu.cit.bebita.lostandfoundportal.strategy;

import edu.cit.bebita.lostandfoundportal.dto.LoginRequest;
import edu.cit.bebita.lostandfoundportal.dto.RegisterRequest;
import edu.cit.bebita.lostandfoundportal.entity.User;
import edu.cit.bebita.lostandfoundportal.exception.InvalidCredentialsException;
import edu.cit.bebita.lostandfoundportal.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class LocalAuthProviderStrategy implements AuthProviderStrategy {

    private final UserService userService;

    @Autowired
    public LocalAuthProviderStrategy(UserService userService) {
        this.userService = userService;
    }

    @Override
    public User register(RegisterRequest request) {
        return userService.registerUser(request);
    }

    @Override
    public User authenticate(LoginRequest request) {
        return userService.authenticateUser(request);
    }

    @Override
    public String getProviderName() {
        return "LOCAL";
    }
}
