package edu.cit.bebita.lostandfoundmobile.shared.network

import edu.cit.bebita.lostandfoundmobile.features.auth.LoginRequest
import edu.cit.bebita.lostandfoundmobile.features.auth.LoginResponse
import edu.cit.bebita.lostandfoundmobile.features.auth.RegisterRequest
import edu.cit.bebita.lostandfoundmobile.features.auth.RegisterResponse
import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.POST

interface ApiService {
    @POST("auth/register")
    fun register(@Body request: RegisterRequest): Call<RegisterResponse>

    @POST("auth/login")
    fun login(@Body request: LoginRequest): Call<LoginResponse>
}