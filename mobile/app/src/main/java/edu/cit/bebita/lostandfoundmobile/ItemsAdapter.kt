package edu.cit.bebita.lostandfoundmobile

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class ItemsAdapter(private var items: List<Item>) : RecyclerView.Adapter<ItemsAdapter.ItemViewHolder>() {

    class ItemViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val titleTextView: TextView = itemView.findViewById(R.id.titleTextView)
        val descriptionTextView: TextView = itemView.findViewById(R.id.descriptionTextView)
        val locationTextView: TextView = itemView.findViewById(R.id.locationTextView)
        val statusTextView: TextView = itemView.findViewById(R.id.statusTextView)
        val claimButton: Button = itemView.findViewById(R.id.claimButton)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ItemViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_card, parent, false)
        return ItemViewHolder(view)
    }

    override fun onBindViewHolder(holder: ItemViewHolder, position: Int) {
        val item = items[position]
        holder.titleTextView.text = item.title
        holder.descriptionTextView.text = item.description
        holder.locationTextView.text = "Location: ${item.location}"
        holder.statusTextView.text = "Status: ${item.status}"
        holder.claimButton.setOnClickListener {
            // TODO: Handle claim action
        }
    }

    override fun getItemCount(): Int = items.size

    fun updateItems(newItems: List<Item>) {
        items = newItems
        notifyDataSetChanged()
    }
}

// Placeholder Item data class
data class Item(
    val id: Long,
    val title: String,
    val description: String,
    val location: String,
    val status: String
)