package edu.cit.bebita.lostandfoundportal.features.admin.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.cit.bebita.lostandfoundportal.features.admin.dto.AdminUserResponse;
import edu.cit.bebita.lostandfoundportal.features.admin.dto.DashboardStatsResponse;
import edu.cit.bebita.lostandfoundportal.features.admin.service.AdminService;
import edu.cit.bebita.lostandfoundportal.features.items.dto.ItemResponse;
import edu.cit.bebita.lostandfoundportal.shared.api.ApiResponse;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard-stats")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats(
            Principal principal) {
        DashboardStatsResponse stats = adminService.getDashboardStats(principal.getName());
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/pending-claims")
    public ResponseEntity<ApiResponse<List<ItemResponse>>> getPendingClaims(
            Principal principal) {
        List<ItemResponse> claims = adminService.getPendingClaims(principal.getName());
        return ResponseEntity.ok(ApiResponse.success(claims));
    }

    @PutMapping("/claims/{id}/approve")
    public ResponseEntity<ApiResponse<ItemResponse>> approveClaim(
            @PathVariable Long id,
            Principal principal) {
        ItemResponse item = adminService.approveClaim(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.success(item));
    }

    @PutMapping("/claims/{id}/reject")
    public ResponseEntity<ApiResponse<ItemResponse>> rejectClaim(
            @PathVariable Long id,
            Principal principal) {
        ItemResponse item = adminService.rejectClaim(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.success(item));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<AdminUserResponse>>> getAllUsers(
            Principal principal) {
        List<AdminUserResponse> users = adminService.getAllUsers(principal.getName());
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/items")
    public ResponseEntity<ApiResponse<List<ItemResponse>>> getAllItems(
            Principal principal) {
        List<ItemResponse> items = adminService.getAllItems(principal.getName());
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable Long id,
            Principal principal) {
        adminService.deleteUser(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteItem(
            @PathVariable Long id,
            Principal principal) {
        adminService.deleteItem(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
