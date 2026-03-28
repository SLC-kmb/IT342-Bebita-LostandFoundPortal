package edu.cit.bebita.lostandfoundmobile

data class RegisterResponse(
    val success: Boolean,
    val data: RegisterData?,
    val error: ErrorDetails?,
    val timestamp: String
)

data class RegisterData(
    val user: User,
    val accessToken: String,
    val refreshToken: String
)

data class User(
    val email: String,
    val firstname: String,
    val lastname: String
)

data class ErrorDetails(
    val code: String,
    val message: String,
    val details: Any?
)