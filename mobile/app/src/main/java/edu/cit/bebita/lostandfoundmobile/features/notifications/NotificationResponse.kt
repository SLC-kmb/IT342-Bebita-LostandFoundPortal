package edu.cit.bebita.lostandfoundmobile.features.notifications

data class NotificationResponse(
    val id: Long,
    val title: String,
    val message: String,
    val isRead: Boolean,
    val createdAt: String
)
