package edu.cit.bebita.lostandfoundmobile.features.items

import android.app.DatePickerDialog
import android.os.Bundle
import android.view.View
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.EditText
import android.widget.ImageButton
import android.widget.Spinner
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import edu.cit.bebita.lostandfoundmobile.R
import edu.cit.bebita.lostandfoundmobile.shared.network.ApiResponse
import edu.cit.bebita.lostandfoundmobile.shared.network.ApiService
import edu.cit.bebita.lostandfoundmobile.shared.network.RetrofitClient
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.util.Calendar

class ReportItemActivity : AppCompatActivity() {

    private lateinit var headerTitle: TextView
    private lateinit var headerSubtitle: TextView
    private lateinit var itemNameEditText: EditText
    private lateinit var descriptionEditText: EditText
    private lateinit var categorySpinner: Spinner
    private lateinit var buildingSpinner: Spinner
    private lateinit var specificLocationEditText: EditText
    private lateinit var dateLabel: TextView
    private lateinit var dateEditText: EditText
    private lateinit var contactInfoEditText: EditText
    private lateinit var submitBtn: Button
    private lateinit var progressBar: View
    private lateinit var locationLabel: TextView
    private lateinit var backBtn: ImageButton

    private var reportType: String = "LOST"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_report_item)

        reportType = intent.getStringExtra("REPORT_TYPE") ?: "LOST"

        initViews()
        setupUI()
        setupListeners()
    }

    private fun initViews() {
        headerTitle = findViewById(R.id.headerTitle)
        headerSubtitle = findViewById(R.id.headerSubtitle)
        itemNameEditText = findViewById(R.id.itemNameEditText)
        descriptionEditText = findViewById(R.id.descriptionEditText)
        categorySpinner = findViewById(R.id.categorySpinner)
        buildingSpinner = findViewById(R.id.buildingSpinner)
        specificLocationEditText = findViewById(R.id.specificLocationEditText)
        dateLabel = findViewById(R.id.dateLabel)
        dateEditText = findViewById(R.id.dateEditText)
        contactInfoEditText = findViewById(R.id.contactInfoEditText)
        submitBtn = findViewById(R.id.submitReportBtn)
        progressBar = findViewById(R.id.progressBar)
        locationLabel = findViewById(R.id.locationLabel)
        backBtn = findViewById(R.id.backBtn)
    }

    private fun setupUI() {
        if (reportType == "LOST") {
            headerTitle.text = "Report a lost item"
            headerSubtitle.text = "Describe what you lost so others can help you find it."
            dateLabel.text = "Date Lost *"
            locationLabel.text = "Where did you lose it? *"
        } else {
            headerTitle.text = "Report a found item"
            headerSubtitle.text = "Thanks for helping out. The more detail you share, the easier it is to find the owner."
            dateLabel.text = "Date Found *"
            locationLabel.text = "Where did you find this item? *"
        }

        val categories = listOf("Select category", "electronics", "clothing", "accessories", "documents", "keys", "other")
        categorySpinner.adapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, categories)

        val buildings = listOf(
            "Select building", "NGE", "RTL", "ACAD", "GLE", "Elem Building", "Annex", "Gym",
            "Covered Court", "Elementary Open Court", "Canteen (Elem Building)",
            "Canteen (Engineering Building)", "Canteen Main", "Parking Area"
        )
        buildingSpinner.adapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, buildings)
    }

    private fun setupListeners() {
        backBtn.setOnClickListener { finish() }

        dateEditText.setOnClickListener {
            val calendar = Calendar.getInstance()
            val year = calendar.get(Calendar.YEAR)
            val month = calendar.get(Calendar.MONTH)
            val day = calendar.get(Calendar.DAY_OF_MONTH)

            val dpd = DatePickerDialog(this, { _, selectedYear, selectedMonth, selectedDay ->
                val dateStr = String.format("%d-%02d-%02d", selectedYear, selectedMonth + 1, selectedDay)
                dateEditText.setText(dateStr)
            }, year, month, day)
            dpd.show()
        }

        submitBtn.setOnClickListener {
            submitReport()
        }
    }

    private fun submitReport() {
        val itemName = itemNameEditText.text.toString().trim()
        val description = descriptionEditText.text.toString().trim()
        val category = categorySpinner.selectedItem.toString()
        val building = buildingSpinner.selectedItem.toString()
        val specificLocation = specificLocationEditText.text.toString().trim()
        val date = dateEditText.text.toString().trim()
        val contactInfo = contactInfoEditText.text.toString().trim()

        if (itemName.isEmpty() || description.isEmpty() || category == "Select category" || building == "Select building" || date.isEmpty()) {
            Toast.makeText(this, "Please fill in all required fields (*)", Toast.LENGTH_SHORT).show()
            return
        }

        val finalLocation = if (specificLocation.isNotEmpty()) "$building - $specificLocation" else building

        progressBar.visibility = View.VISIBLE
        submitBtn.isEnabled = false

        val apiService = RetrofitClient.getInstance(this).create(ApiService::class.java)

        if (reportType == "LOST") {
            val request = ReportLostItemRequest(itemName, description, category, finalLocation, date, contactInfo, "")
            apiService.reportLostItem(request).enqueue(object : Callback<ApiResponse<ItemResponse>> {
                override fun onResponse(call: Call<ApiResponse<ItemResponse>>, response: Response<ApiResponse<ItemResponse>>) {
                    handleResponse(response)
                }
                override fun onFailure(call: Call<ApiResponse<ItemResponse>>, t: Throwable) {
                    handleFailure(t)
                }
            })
        } else {
            val request = ReportFoundItemRequest(itemName, description, category, finalLocation, date, contactInfo, "")
            apiService.reportFoundItem(request).enqueue(object : Callback<ApiResponse<ItemResponse>> {
                override fun onResponse(call: Call<ApiResponse<ItemResponse>>, response: Response<ApiResponse<ItemResponse>>) {
                    handleResponse(response)
                }
                override fun onFailure(call: Call<ApiResponse<ItemResponse>>, t: Throwable) {
                    handleFailure(t)
                }
            })
        }
    }

    private fun handleResponse(response: Response<ApiResponse<ItemResponse>>) {
        progressBar.visibility = View.GONE
        submitBtn.isEnabled = true
        if (response.isSuccessful && response.body()?.success == true) {
            Toast.makeText(this, "Report submitted successfully!", Toast.LENGTH_SHORT).show()
            finish()
        } else {
            Toast.makeText(this, "Failed to submit report. Try again.", Toast.LENGTH_SHORT).show()
        }
    }

    private fun handleFailure(t: Throwable) {
        progressBar.visibility = View.GONE
        submitBtn.isEnabled = true
        Toast.makeText(this, "Network Error: ${t.message}", Toast.LENGTH_SHORT).show()
    }
}
