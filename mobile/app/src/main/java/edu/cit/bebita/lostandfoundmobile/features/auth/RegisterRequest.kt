package edu.cit.bebita.lostandfoundmobile.features.auth

data class RegisterRequest(
    val email: String,
    val password: String,
    val firstname: String,
    val lastname: String
)