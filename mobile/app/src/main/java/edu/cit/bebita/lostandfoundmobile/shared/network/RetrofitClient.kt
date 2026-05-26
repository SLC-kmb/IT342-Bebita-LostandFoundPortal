package edu.cit.bebita.lostandfoundmobile.shared.network

import android.content.Context
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitClient {
    // LOCAL TESTING CONFIGURATION (Uncomment these if you want to test locally)
    // private const val IP_ADDRESS = "192.168.1.5"
    // private const val BASE_URL = "http://$IP_ADDRESS:8081/api/v1/"
    // val WEBSOCKET_URL = "ws://$IP_ADDRESS:8081/ws"

    // LIVE RENDER CONFIGURATION (Default)
    private const val BASE_URL = "https://it342-bebita-lostandfoundportal.onrender.com/api/v1/"
    val WEBSOCKET_URL = "wss://it342-bebita-lostandfoundportal.onrender.com/ws"

    private var retrofit: Retrofit? = null

    fun getInstance(context: Context): Retrofit {
        if (retrofit == null) {
            val sessionManager = SessionManager(context)
            
            val client = OkHttpClient.Builder()
                .connectTimeout(120, java.util.concurrent.TimeUnit.SECONDS)
                .readTimeout(120, java.util.concurrent.TimeUnit.SECONDS)
                .writeTimeout(120, java.util.concurrent.TimeUnit.SECONDS)
                .addInterceptor { chain ->
                    val requestBuilder = chain.request().newBuilder()
                    sessionManager.fetchAuthToken()?.let { token ->
                        requestBuilder.addHeader("Authorization", "Bearer $token")
                    }
                    chain.proceed(requestBuilder.build())
                }.build()

            retrofit = Retrofit.Builder()
                .baseUrl(BASE_URL)
                .client(client)
                .addConverterFactory(GsonConverterFactory.create())
                .build()
        }
        return retrofit!!
    }
}