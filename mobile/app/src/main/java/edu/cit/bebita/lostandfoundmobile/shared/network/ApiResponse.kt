package edu.cit.bebita.lostandfoundmobile.shared.network

data class ApiResponse<T>(
    val success: Boolean,
    val data: T?,
    val error: Any?
)
