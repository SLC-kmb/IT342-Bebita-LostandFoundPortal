package edu.cit.bebita.lostandfoundmobile.features.notifications

import android.os.Bundle
import android.view.View
import android.widget.ImageButton
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import edu.cit.bebita.lostandfoundmobile.R
import edu.cit.bebita.lostandfoundmobile.shared.network.ApiResponse
import edu.cit.bebita.lostandfoundmobile.shared.network.ApiService
import edu.cit.bebita.lostandfoundmobile.shared.network.RetrofitClient
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class NotificationsActivity : AppCompatActivity() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var adapter: NotificationsAdapter
    private lateinit var progressBar: View
    private lateinit var emptyState: View
    private lateinit var clearAllBtn: TextView
    private lateinit var backBtn: ImageButton

    private var notificationsList = mutableListOf<NotificationResponse>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_notifications)

        progressBar = findViewById(R.id.progressBar)
        emptyState = findViewById(R.id.emptyState)
        clearAllBtn = findViewById(R.id.clearAllBtn)
        backBtn = findViewById(R.id.backBtn)

        recyclerView = findViewById(R.id.notificationsRecyclerView)
        recyclerView.layoutManager = LinearLayoutManager(this)

        adapter = NotificationsAdapter(emptyList())
        
        adapter.onNotificationClicked = { notif ->
            if (!notif.isRead) {
                markAsRead(notif.id)
            }
        }

        adapter.onDeleteClicked = { notif ->
            deleteNotification(notif.id)
        }

        recyclerView.adapter = adapter

        backBtn.setOnClickListener { finish() }
        clearAllBtn.setOnClickListener { clearAllNotifications() }

        fetchNotifications()
    }

    private fun fetchNotifications() {
        progressBar.visibility = View.VISIBLE
        emptyState.visibility = View.GONE
        
        val apiService = RetrofitClient.getInstance(this).create(ApiService::class.java)
        apiService.getNotifications().enqueue(object : Callback<ApiResponse<List<NotificationResponse>>> {
            override fun onResponse(call: Call<ApiResponse<List<NotificationResponse>>>, response: Response<ApiResponse<List<NotificationResponse>>>) {
                progressBar.visibility = View.GONE
                if (response.isSuccessful && response.body()?.success == true) {
                    notificationsList.clear()
                    response.body()?.data?.let { notificationsList.addAll(it) }
                    
                    if (notificationsList.isEmpty()) {
                        emptyState.visibility = View.VISIBLE
                        clearAllBtn.visibility = View.GONE
                    } else {
                        emptyState.visibility = View.GONE
                        clearAllBtn.visibility = View.VISIBLE
                        adapter.updateData(notificationsList)
                    }
                } else {
                    Toast.makeText(this@NotificationsActivity, "Failed to load notifications", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<ApiResponse<List<NotificationResponse>>>, t: Throwable) {
                progressBar.visibility = View.GONE
                Toast.makeText(this@NotificationsActivity, "Network error: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun markAsRead(id: Long) {
        val apiService = RetrofitClient.getInstance(this).create(ApiService::class.java)
        apiService.markNotificationAsRead(id).enqueue(object : Callback<ApiResponse<Void>> {
            override fun onResponse(call: Call<ApiResponse<Void>>, response: Response<ApiResponse<Void>>) {
                if (response.isSuccessful) {
                    val index = notificationsList.indexOfFirst { it.id == id }
                    if (index != -1) {
                        notificationsList[index] = notificationsList[index].copy(isRead = true)
                        adapter.updateData(notificationsList)
                    }
                }
            }
            override fun onFailure(call: Call<ApiResponse<Void>>, t: Throwable) {}
        })
    }

    private fun deleteNotification(id: Long) {
        val apiService = RetrofitClient.getInstance(this).create(ApiService::class.java)
        apiService.clearNotification(id).enqueue(object : Callback<ApiResponse<Void>> {
            override fun onResponse(call: Call<ApiResponse<Void>>, response: Response<ApiResponse<Void>>) {
                if (response.isSuccessful) {
                    notificationsList.removeAll { it.id == id }
                    adapter.updateData(notificationsList)
                    if (notificationsList.isEmpty()) {
                        emptyState.visibility = View.VISIBLE
                        clearAllBtn.visibility = View.GONE
                    }
                }
            }
            override fun onFailure(call: Call<ApiResponse<Void>>, t: Throwable) {}
        })
    }

    private fun clearAllNotifications() {
        val apiService = RetrofitClient.getInstance(this).create(ApiService::class.java)
        apiService.clearAllNotifications().enqueue(object : Callback<ApiResponse<Void>> {
            override fun onResponse(call: Call<ApiResponse<Void>>, response: Response<ApiResponse<Void>>) {
                if (response.isSuccessful) {
                    notificationsList.clear()
                    adapter.updateData(notificationsList)
                    emptyState.visibility = View.VISIBLE
                    clearAllBtn.visibility = View.GONE
                    Toast.makeText(this@NotificationsActivity, "Cleared all notifications", Toast.LENGTH_SHORT).show()
                }
            }
            override fun onFailure(call: Call<ApiResponse<Void>>, t: Throwable) {}
        })
    }
}
