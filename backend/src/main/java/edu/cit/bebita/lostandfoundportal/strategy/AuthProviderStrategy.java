package edu.cit.bebita.lostandfoundportal.strategy;

import edu.cit.bebita.lostandfoundportal.dto.LoginRequest;
import edu.cit.bebita.lostandfoundportal.dto.RegisterRequest;
import edu.cit.bebita.lostandfoundportal.entity.User;

public interface AuthProviderStrategy {

    User register(RegisterRequest request);

    User authenticate(LoginRequest request);

    String getProviderName();
}
