package edu.cit.bebita.lostandfoundmobile.features.auth

import com.google.gson.annotations.SerializedName

data class LoginResponse(
    val success: Boolean,
    val data: LoginData?,
    val error: ErrorDetails?,
    val timestamp: String
)

data class LoginData(
    val user: UserWithRole,
    @SerializedName("token")
    val accessToken: String?,
    val refreshToken: String?
)

data class UserWithRole(
    val email: String,
    val firstname: String,
    val lastname: String,
    val role: String
)