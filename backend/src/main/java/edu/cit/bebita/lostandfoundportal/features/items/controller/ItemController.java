package edu.cit.bebita.lostandfoundportal.features.items.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.security.Principal;

import edu.cit.bebita.lostandfoundportal.features.items.dto.ItemResponse;
import edu.cit.bebita.lostandfoundportal.features.items.dto.ReportFoundItemRequest;
import edu.cit.bebita.lostandfoundportal.features.items.dto.ReportLostItemRequest;
import edu.cit.bebita.lostandfoundportal.features.items.service.ItemService;
import edu.cit.bebita.lostandfoundportal.shared.api.ApiResponse;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/items")
public class ItemController {

    private final ItemService itemService;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    @PostMapping("/lost")
    public ResponseEntity<ApiResponse<ItemResponse>> reportLostItem(
            @Valid @RequestBody ReportLostItemRequest request,
            Principal principal) {
        ItemResponse item = itemService.reportLostItem(request, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(item));
    }

    @PostMapping("/found")
    public ResponseEntity<ApiResponse<ItemResponse>> reportFoundItem(
            @Valid @RequestBody ReportFoundItemRequest request,
            Principal principal) {
        ItemResponse item = itemService.reportFoundItem(request, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(item));
    }

    @GetMapping("/lost")
    public ResponseEntity<ApiResponse<List<ItemResponse>>> getLostItems() {
        List<ItemResponse> items = itemService.getLostItems();
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    @GetMapping("/found")
    public ResponseEntity<ApiResponse<List<ItemResponse>>> getFoundItems() {
        List<ItemResponse> items = itemService.getFoundItems();
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ItemResponse>> getItemById(@PathVariable Long id) {
        ItemResponse item = itemService.getItemById(id);
        return ResponseEntity.ok(ApiResponse.success(item));
    }

    @PutMapping("/claim/{id}")
    public ResponseEntity<ApiResponse<ItemResponse>> claimItem(
            @PathVariable Long id,
            Principal principal) {
        ItemResponse item = itemService.claimItem(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.success(item));
    }
}