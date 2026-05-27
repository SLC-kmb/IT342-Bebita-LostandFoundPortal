package edu.cit.bebita.lostandfoundmobile.shared.network

import edu.cit.bebita.lostandfoundmobile.features.auth.LoginRequest
import edu.cit.bebita.lostandfoundmobile.features.auth.LoginResponse
import edu.cit.bebita.lostandfoundmobile.features.auth.RegisterRequest
import edu.cit.bebita.lostandfoundmobile.features.auth.RegisterResponse
import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT

interface ApiService {
    @POST("auth/register")
    fun register(@Body request: RegisterRequest): Call<RegisterResponse>

    @POST("auth/login")
    fun login(@Body request: LoginRequest): Call<LoginResponse>

    @GET("items/lost")
    fun getLostItems(): Call<ApiResponse<List<edu.cit.bebita.lostandfoundmobile.features.items.ItemResponse>>>

    @GET("items/found")
    fun getFoundItems(): Call<ApiResponse<List<edu.cit.bebita.lostandfoundmobile.features.items.ItemResponse>>>

    @GET("items")
    fun getAllItems(): Call<ApiResponse<List<edu.cit.bebita.lostandfoundmobile.features.items.ItemResponse>>>

    @PUT("items/claim/{id}")
    fun claimItem(@retrofit2.http.Path("id") id: Long): Call<ApiResponse<edu.cit.bebita.lostandfoundmobile.features.items.ItemResponse>>

    @POST("items/lost")
    fun reportLostItem(@Body request: edu.cit.bebita.lostandfoundmobile.features.items.ReportLostItemRequest): Call<ApiResponse<edu.cit.bebita.lostandfoundmobile.features.items.ItemResponse>>

    @POST("items/found")
    fun reportFoundItem(@Body request: edu.cit.bebita.lostandfoundmobile.features.items.ReportFoundItemRequest): Call<ApiResponse<edu.cit.bebita.lostandfoundmobile.features.items.ItemResponse>>

    @GET("notifications")
    fun getNotifications(): Call<ApiResponse<List<edu.cit.bebita.lostandfoundmobile.features.notifications.NotificationResponse>>>

    @POST("notifications/{id}/read")
    fun markNotificationAsRead(@retrofit2.http.Path("id") id: Long): Call<ApiResponse<Void>>

    @retrofit2.http.DELETE("notifications/{id}")
    fun clearNotification(@retrofit2.http.Path("id") id: Long): Call<ApiResponse<Void>>

    @retrofit2.http.DELETE("notifications")
    fun clearAllNotifications(): Call<ApiResponse<Void>>
}