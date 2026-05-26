package edu.cit.bebita.lostandfoundmobile.features.items

data class ReportLostItemRequest(
    val itemName: String,
    val description: String,
    val category: String,
    val location: String,
    val dateLost: String,
    val contactInfo: String? = null,
    val imageUrl: String? = ""
)

data class ReportFoundItemRequest(
    val itemName: String,
    val description: String,
    val category: String,
    val location: String,
    val dateFound: String,
    val contactInfo: String? = null,
    val imageUrl: String? = ""
)
