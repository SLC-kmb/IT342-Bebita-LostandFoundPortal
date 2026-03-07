package edu.cit.bebita.lostandfoundportal.dto;

public class AuthResponse {

    private UserResponse user;
    private String accessToken;
    private String refreshToken;

    public AuthResponse(UserResponse user, String accessToken, String refreshToken) {
        this.user = user;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }

    public UserResponse getUser() { return user; }
    public String getAccessToken() { return accessToken; }
    public String getRefreshToken() { return refreshToken; }
}
