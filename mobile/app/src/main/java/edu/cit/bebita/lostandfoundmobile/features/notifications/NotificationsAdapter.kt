package edu.cit.bebita.lostandfoundmobile.features.notifications

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import edu.cit.bebita.lostandfoundmobile.R

class NotificationsAdapter(private var notifications: List<NotificationResponse>) :
    RecyclerView.Adapter<NotificationsAdapter.ViewHolder>() {

    var onNotificationClicked: ((NotificationResponse) -> Unit)? = null
    var onDeleteClicked: ((NotificationResponse) -> Unit)? = null

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val title: TextView = view.findViewById(R.id.notificationTitle)
        val message: TextView = view.findViewById(R.id.notificationMessage)
        val time: TextView = view.findViewById(R.id.notificationTime)
        val unreadIndicator: View = view.findViewById(R.id.unreadIndicator)
        val deleteBtn: ImageButton = view.findViewById(R.id.deleteBtn)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_notification, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val notif = notifications[position]
        holder.title.text = notif.title
        holder.message.text = notif.message
        
        // Format time (simplified for display)
        val dateStr = notif.createdAt.replace("T", " ").substringBeforeLast(".")
        holder.time.text = dateStr

        if (notif.isRead) {
            holder.unreadIndicator.visibility = View.INVISIBLE
            holder.itemView.alpha = 0.7f
        } else {
            holder.unreadIndicator.visibility = View.VISIBLE
            holder.itemView.alpha = 1.0f
        }

        holder.itemView.setOnClickListener {
            onNotificationClicked?.invoke(notif)
        }

        holder.deleteBtn.setOnClickListener {
            onDeleteClicked?.invoke(notif)
        }
    }

    override fun getItemCount() = notifications.size

    fun updateData(newNotifications: List<NotificationResponse>) {
        this.notifications = newNotifications
        notifyDataSetChanged()
    }
}
