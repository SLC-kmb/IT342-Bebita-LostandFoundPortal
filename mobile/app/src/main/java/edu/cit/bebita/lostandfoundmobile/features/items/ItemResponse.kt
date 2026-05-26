package edu.cit.bebita.lostandfoundmobile.features.items

data class ItemResponse(
    val id: Long,
    val itemName: String?,
    val description: String?,
    val category: String?,
    val location: String?,
    val dateLost: String?,
    val dateFound: String?,
    val contactInfo: String?,
    val type: String?,
    val status: String?,
    val reportedBy: UserResponse?,
    val claimedBy: UserResponse?,
    val createdAt: String?,
    val updatedAt: String?,
    val imageUrl: String?
)

data class UserResponse(
    val id: Long,
    val firstName: String,
    val lastName: String,
    val email: String,
    val idNumber: String?
)
