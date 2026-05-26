package edu.cit.bebita.lostandfoundmobile.features.items

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import edu.cit.bebita.lostandfoundmobile.R

class ItemsAdapter(private var items: List<ItemResponse>) : RecyclerView.Adapter<ItemsAdapter.ItemViewHolder>() {

    var onClaimClicked: ((ItemResponse) -> Unit)? = null

    class ItemViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val itemImageView: ImageView = itemView.findViewById(R.id.itemImageView)
        val statusBadge: LinearLayout = itemView.findViewById(R.id.statusBadge)
        val statusDot: View = itemView.findViewById(R.id.statusDot)
        val statusText: TextView = itemView.findViewById(R.id.statusText)
        val itemCategoryText: TextView = itemView.findViewById(R.id.itemCategoryText)
        val itemNameText: TextView = itemView.findViewById(R.id.itemNameText)
        val itemLocationText: TextView = itemView.findViewById(R.id.itemLocationText)
        val itemDateText: TextView = itemView.findViewById(R.id.itemDateText)
        val claimButton: Button = itemView.findViewById(R.id.claimButton)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ItemViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_card, parent, false)
        return ItemViewHolder(view)
    }

    override fun onBindViewHolder(holder: ItemViewHolder, position: Int) {
        val item = items[position]
        
        holder.itemNameText.text = item.itemName ?: "Unknown Item"
        holder.itemCategoryText.text = item.category?.uppercase() ?: "OTHER"
        holder.itemLocationText.text = item.location ?: "Unknown location"
        
        // Load image using Glide
        if (!item.imageUrl.isNullOrEmpty()) {
            Glide.with(holder.itemView.context)
                .load(item.imageUrl)
                .into(holder.itemImageView)
        } else {
            // Set a fallback color or image
            holder.itemImageView.setImageResource(android.R.color.transparent)
        }
        
        // Show date depending on type
        val itemType = item.type ?: "unknown"
        val dateString = if (itemType.lowercase() == "lost") {
            "Lost: ${item.dateLost ?: "Unknown"}"
        } else {
            "Found: ${item.dateFound ?: "Unknown"}"
        }
        holder.itemDateText.text = dateString
        
        val itemStatus = item.status ?: "active"
        holder.statusText.text = if (itemStatus.lowercase() == "active") "Available" else "Review Pending"
        
        // Placeholder for claim action
        holder.claimButton.setOnClickListener {
            onClaimClicked?.invoke(item)
        }
    }

    override fun getItemCount(): Int = items.size

    fun updateItems(newItems: List<ItemResponse>) {
        items = newItems
        notifyDataSetChanged()
    }
}