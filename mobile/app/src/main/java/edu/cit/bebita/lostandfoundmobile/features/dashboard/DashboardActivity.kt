package edu.cit.bebita.lostandfoundmobile.features.dashboard

import android.annotation.SuppressLint
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.gson.Gson
import edu.cit.bebita.lostandfoundmobile.R
import edu.cit.bebita.lostandfoundmobile.features.items.ItemResponse
import edu.cit.bebita.lostandfoundmobile.features.items.ItemsAdapter
import edu.cit.bebita.lostandfoundmobile.shared.network.ApiService
import edu.cit.bebita.lostandfoundmobile.shared.network.RetrofitClient
import edu.cit.bebita.lostandfoundmobile.shared.network.SessionManager
import io.reactivex.android.schedulers.AndroidSchedulers
import io.reactivex.disposables.CompositeDisposable
import io.reactivex.schedulers.Schedulers
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import ua.naiksoftware.stomp.Stomp
import ua.naiksoftware.stomp.StompClient
import ua.naiksoftware.stomp.dto.StompHeader

class DashboardActivity : AppCompatActivity() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var adapter: ItemsAdapter
    private lateinit var itemCountTextView: TextView
    private lateinit var progressBar: View

    private var mStompClient: StompClient? = null
    private var compositeDisposable: CompositeDisposable? = null
    private var itemsList = mutableListOf<ItemResponse>()
    private var unreadNotificationsCount = 0
    private lateinit var notificationBadge: TextView
    private lateinit var greetingTextView: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_dashboard)

        progressBar = findViewById(R.id.progressBar)
        itemCountTextView = findViewById(R.id.itemCountTextView)
        notificationBadge = findViewById(R.id.notificationBadge)
        greetingTextView = findViewById(R.id.greetingTextView)

        val sessionManager = SessionManager(this)
        val userEmail = sessionManager.fetchUserEmail() ?: "User"
        val firstName = userEmail.split("@")[0].replaceFirstChar { it.uppercase() }
        greetingTextView.text = "Hello, $firstName \uD83D\uDC4B"

        recyclerView = findViewById(R.id.itemsRecyclerView)
        recyclerView.layoutManager = LinearLayoutManager(this)
        
        adapter = ItemsAdapter(emptyList())
        adapter.onClaimClicked = { item ->
            claimItem(item)
        }
        recyclerView.adapter = adapter

        // FAB Setup
        val fabReportLost: View = findViewById(R.id.fabReportLost)
        val fabReportFound: View = findViewById(R.id.fabReportFound)

        fabReportLost.setOnClickListener {
            val intent = android.content.Intent(this, edu.cit.bebita.lostandfoundmobile.features.items.ReportItemActivity::class.java)
            intent.putExtra("REPORT_TYPE", "LOST")
            startActivity(intent)
        }

        fabReportFound.setOnClickListener {
            val intent = android.content.Intent(this, edu.cit.bebita.lostandfoundmobile.features.items.ReportItemActivity::class.java)
            intent.putExtra("REPORT_TYPE", "FOUND")
            startActivity(intent)
        }

        val bellIconContainer: View = findViewById(R.id.bellIconContainer)
        bellIconContainer.setOnClickListener {
            startActivity(android.content.Intent(this, edu.cit.bebita.lostandfoundmobile.features.notifications.NotificationsActivity::class.java))
        }

        loadInitialItems()
        fetchNotifications()
        connectToStomp()
    }

    override fun onResume() {
        super.onResume()
        // Refresh notifications when returning
        fetchNotifications()
    }

    private fun fetchNotifications() {
        val apiService = RetrofitClient.getInstance(this).create(ApiService::class.java)
        apiService.getNotifications().enqueue(object : Callback<edu.cit.bebita.lostandfoundmobile.shared.network.ApiResponse<List<edu.cit.bebita.lostandfoundmobile.features.notifications.NotificationResponse>>> {
            override fun onResponse(call: Call<edu.cit.bebita.lostandfoundmobile.shared.network.ApiResponse<List<edu.cit.bebita.lostandfoundmobile.features.notifications.NotificationResponse>>>, response: Response<edu.cit.bebita.lostandfoundmobile.shared.network.ApiResponse<List<edu.cit.bebita.lostandfoundmobile.features.notifications.NotificationResponse>>>) {
                if (response.isSuccessful && response.body()?.success == true) {
                    val notifications = response.body()?.data ?: emptyList()
                    val unread = notifications.count { !it.isRead }
                    updateNotificationBadge(unread)
                }
            }
            override fun onFailure(call: Call<edu.cit.bebita.lostandfoundmobile.shared.network.ApiResponse<List<edu.cit.bebita.lostandfoundmobile.features.notifications.NotificationResponse>>>, t: Throwable) {}
        })
    }

    private fun updateNotificationBadge(count: Int) {
        unreadNotificationsCount = count
        if (count > 0) {
            notificationBadge.visibility = View.VISIBLE
            notificationBadge.text = count.toString()
        } else {
            notificationBadge.visibility = View.GONE
        }
    }

    private fun loadInitialItems() {
        progressBar.visibility = View.VISIBLE
        val apiService = RetrofitClient.getInstance(this).create(ApiService::class.java)
        
        apiService.getItems().enqueue(object : Callback<List<ItemResponse>> {
            @SuppressLint("SetTextI18n")
            override fun onResponse(call: Call<List<ItemResponse>>, response: Response<List<ItemResponse>>) {
                progressBar.visibility = View.GONE
                if (response.isSuccessful) {
                    response.body()?.let {
                        itemsList.clear()
                        itemsList.addAll(it)
                        adapter.updateItems(itemsList)
                        itemCountTextView.text = "${itemsList.size} items currently in our network"
                    }
                } else {
                    Toast.makeText(this@DashboardActivity, "Failed to load feed", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<List<ItemResponse>>, t: Throwable) {
                progressBar.visibility = View.GONE
                Toast.makeText(this@DashboardActivity, "Network error: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun claimItem(item: ItemResponse) {
        val apiService = RetrofitClient.getInstance(this).create(ApiService::class.java)
        apiService.claimItem(item.id).enqueue(object : Callback<edu.cit.bebita.lostandfoundmobile.shared.network.ApiResponse<ItemResponse>> {
            override fun onResponse(call: Call<edu.cit.bebita.lostandfoundmobile.shared.network.ApiResponse<ItemResponse>>, response: Response<edu.cit.bebita.lostandfoundmobile.shared.network.ApiResponse<ItemResponse>>) {
                if (response.isSuccessful && response.body()?.success == true) {
                    Toast.makeText(this@DashboardActivity, "Claim successful! Awaiting approval.", Toast.LENGTH_SHORT).show()
                    // The STOMP connection should receive the update and re-render the card.
                } else {
                    Toast.makeText(this@DashboardActivity, "Failed to claim item.", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<edu.cit.bebita.lostandfoundmobile.shared.network.ApiResponse<ItemResponse>>, t: Throwable) {
                Toast.makeText(this@DashboardActivity, "Network error: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }

    @SuppressLint("CheckResult")
    private fun connectToStomp() {
        val sessionManager = SessionManager(this)
        val token = sessionManager.fetchAuthToken()
        val userEmail = sessionManager.fetchUserEmail() ?: ""

        val headers = listOf(
            StompHeader("Authorization", "Bearer $token")
        )

        // Stomp URL format typically requires appending /websocket if using sockjs/spring
        // However, standard Spring websocket might just be /ws
        mStompClient = Stomp.over(Stomp.ConnectionProvider.OKHTTP, RetrofitClient.WEBSOCKET_URL + "/websocket")

        compositeDisposable = CompositeDisposable()

        val lifecycleDisposable = mStompClient!!.lifecycle()
            .subscribeOn(Schedulers.io())
            .observeOn(AndroidSchedulers.mainThread())
            .subscribe { lifecycleEvent ->
                when (lifecycleEvent.type) {
                    ua.naiksoftware.stomp.dto.LifecycleEvent.Type.OPENED -> {
                        Log.i("Stomp", "Stomp connection opened")
                    }
                    ua.naiksoftware.stomp.dto.LifecycleEvent.Type.ERROR -> {
                        Log.e("Stomp", "Error", lifecycleEvent.exception)
                    }
                    ua.naiksoftware.stomp.dto.LifecycleEvent.Type.CLOSED -> {
                        Log.i("Stomp", "Stomp connection closed")
                    }
                    else -> {}
                }
            }
        compositeDisposable?.add(lifecycleDisposable)

        val topicDisposable = mStompClient!!.topic("/topic/items")
            .subscribeOn(Schedulers.io())
            .observeOn(AndroidSchedulers.mainThread())
            .subscribe({ topicMessage ->
                val gson = Gson()
                val updatedItem = gson.fromJson(topicMessage.payload, ItemResponse::class.java)
                Log.d("Stomp", "Received update for item ${updatedItem.id}")
                
                // Update local list
                val index = itemsList.indexOfFirst { it.id == updatedItem.id }
                if (index != -1) {
                    itemsList[index] = updatedItem
                } else {
                    itemsList.add(0, updatedItem)
                }
                adapter.updateItems(itemsList)
                itemCountTextView.text = "${itemsList.size} items currently in our network"
            }, { error ->
                Log.e("Stomp", "Topic error", error)
            })

        compositeDisposable?.add(topicDisposable)

        if (userEmail.isNotEmpty()) {
            val safeEmail = userEmail.replace("[@.]".toRegex(), "_")
            val notifDisposable = mStompClient!!.topic("/topic/notifications/$safeEmail")
                .subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe({ topicMessage ->
                    Log.d("Stomp", "Received notification")
                    val gson = Gson()
                    val newNotif = gson.fromJson(topicMessage.payload, edu.cit.bebita.lostandfoundmobile.features.notifications.NotificationResponse::class.java)
                    updateNotificationBadge(unreadNotificationsCount + 1)
                    Toast.makeText(this@DashboardActivity, "🔔 " + newNotif.title, Toast.LENGTH_LONG).show()
                }, { error ->
                    Log.e("Stomp", "Notification Topic error", error)
                })
            compositeDisposable?.add(notifDisposable)
        }

        mStompClient?.connect(headers)
    }

    override fun onDestroy() {
        mStompClient?.disconnect()
        compositeDisposable?.dispose()
        super.onDestroy()
    }
}