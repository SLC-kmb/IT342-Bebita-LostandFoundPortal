package edu.cit.bebita.lostandfoundportal.controller;

import edu.cit.bebita.lostandfoundportal.dto.ApiResponse;
import edu.cit.bebita.lostandfoundportal.dto.ItemResponse;
import edu.cit.bebita.lostandfoundportal.dto.ReportFoundItemRequest;
import edu.cit.bebita.lostandfoundportal.dto.ReportLostItemRequest;
import edu.cit.bebita.lostandfoundportal.service.ItemService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
            @RequestHeader("X-User-Email") String userEmail) {
        ItemResponse item = itemService.reportLostItem(request, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(item));
    }

    @PostMapping("/found")
    public ResponseEntity<ApiResponse<ItemResponse>> reportFoundItem(
            @Valid @RequestBody ReportFoundItemRequest request,
            @RequestHeader("X-User-Email") String userEmail) {
        ItemResponse item = itemService.reportFoundItem(request, userEmail);
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

    @PutMapping("/claim/{id}")
    public ResponseEntity<ApiResponse<ItemResponse>> claimItem(
            @PathVariable Long id,
            @RequestHeader("X-User-Email") String userEmail) {
        ItemResponse item = itemService.claimItem(id, userEmail);
        return ResponseEntity.ok(ApiResponse.success(item));
    }
}