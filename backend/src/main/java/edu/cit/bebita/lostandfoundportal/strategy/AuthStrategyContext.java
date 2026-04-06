package edu.cit.bebita.lostandfoundportal.strategy;

import edu.cit.bebita.lostandfoundportal.dto.LoginRequest;
import edu.cit.bebita.lostandfoundportal.dto.RegisterRequest;
import edu.cit.bebita.lostandfoundportal.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class AuthStrategyContext {

    private final Map<String, AuthProviderStrategy> strategies = new ConcurrentHashMap<>();

    @Autowired
    public AuthStrategyContext(LocalAuthProviderStrategy localAuthProviderStrategy) {
        // Register available strategies
        strategies.put(localAuthProviderStrategy.getProviderName(), localAuthProviderStrategy);
    }

    public User register(String provider, RegisterRequest request) {
        AuthProviderStrategy strategy = strategies.get(provider.toUpperCase());
        if (strategy == null) {
            throw new IllegalArgumentException("Unsupported authentication provider: " + provider);
        }
        return strategy.register(request);
    }

    public User authenticate(String provider, LoginRequest request) {
        AuthProviderStrategy strategy = strategies.get(provider.toUpperCase());
        if (strategy == null) {
            throw new IllegalArgumentException("Unsupported authentication provider: " + provider);
        }
        return strategy.authenticate(request);
    }

    public void addStrategy(String providerName, AuthProviderStrategy strategy) {
        strategies.put(providerName.toUpperCase(), strategy);
    }

    public void removeStrategy(String providerName) {
        strategies.remove(providerName.toUpperCase());
    }
}
