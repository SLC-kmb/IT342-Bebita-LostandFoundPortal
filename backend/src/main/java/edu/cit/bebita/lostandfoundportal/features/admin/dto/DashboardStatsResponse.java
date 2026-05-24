package edu.cit.bebita.lostandfoundportal.features.admin.dto;

public class DashboardStatsResponse {

    private long totalItems;
    private long pendingClaims;
    private long activeItems;
    private long totalUsers;
    private long lostItems;
    private long foundItems;

    public DashboardStatsResponse() {}

    public DashboardStatsResponse(long totalItems, long pendingClaims, long activeItems,
                                   long totalUsers, long lostItems, long foundItems) {
        this.totalItems = totalItems;
        this.pendingClaims = pendingClaims;
        this.activeItems = activeItems;
        this.totalUsers = totalUsers;
        this.lostItems = lostItems;
        this.foundItems = foundItems;
    }

    public long getTotalItems() { return totalItems; }
    public void setTotalItems(long totalItems) { this.totalItems = totalItems; }

    public long getPendingClaims() { return pendingClaims; }
    public void setPendingClaims(long pendingClaims) { this.pendingClaims = pendingClaims; }

    public long getActiveItems() { return activeItems; }
    public void setActiveItems(long activeItems) { this.activeItems = activeItems; }

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

    public long getLostItems() { return lostItems; }
    public void setLostItems(long lostItems) { this.lostItems = lostItems; }

    public long getFoundItems() { return foundItems; }
    public void setFoundItems(long foundItems) { this.foundItems = foundItems; }
}
