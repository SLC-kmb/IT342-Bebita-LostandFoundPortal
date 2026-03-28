package edu.cit.bebita.lostandfoundmobile

data class RegisterRequest(
    val email: String,
    val password: String,
    val firstname: String,
    val lastname: String
)