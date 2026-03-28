package edu.cit.bebita.lostandfoundmobile

import android.os.Bundle
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView

class DashboardActivity : AppCompatActivity() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var adapter: ItemsAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_dashboard)

        recyclerView = findViewById(R.id.itemsRecyclerView)
        recyclerView.layoutManager = LinearLayoutManager(this)
        adapter = ItemsAdapter(emptyList()) // Placeholder for now
        recyclerView.adapter = adapter

        // TODO: Load items from API
        loadItems()
    }

    private fun loadItems() {
        val progressBar = findViewById<View>(R.id.progressBar)
        progressBar.visibility = View.VISIBLE

        // Placeholder: In real implementation, call API to get items
        // For now, show empty list
        progressBar.visibility = View.GONE
    }
}