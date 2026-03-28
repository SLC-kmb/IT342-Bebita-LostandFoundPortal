package edu.cit.bebita.lostandfoundmobile

data class LoginResponse(
    val success: Boolean,
    val data: LoginData?,
    val error: ErrorDetails?,
    val timestamp: String
)

data class LoginData(
    val user: UserWithRole,
    val accessToken: String,
    val refreshToken: String
)

data class UserWithRole(
    val email: String,
    val firstname: String,
    val lastname: String,
    val role: String
)