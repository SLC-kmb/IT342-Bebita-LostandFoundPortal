package edu.cit.bebita.lostandfoundportal.controller;

import edu.cit.bebita.lostandfoundportal.dto.ApiError;
import edu.cit.bebita.lostandfoundportal.dto.ApiResponse;
import edu.cit.bebita.lostandfoundportal.dto.CreateItemRequest;
import edu.cit.bebita.lostandfoundportal.dto.ItemDto;
import edu.cit.bebita.lostandfoundportal.facade.ItemManagementFacade;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/items")
public class ItemController {

    private final ItemManagementFacade itemManagementFacade;

    public ItemController(ItemManagementFacade itemManagementFacade) {
        this.itemManagementFacade = itemManagementFacade;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ItemDto>> createItem(
            @Valid @RequestBody CreateItemRequest request,
            Authentication authentication) {

        String userEmail = authentication.getName();
        ItemDto item = itemManagementFacade.createItem(request, userEmail);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(item));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ItemDto>>> searchItems(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status) {

        List<ItemDto> items = itemManagementFacade.searchItems(keyword, category, status);
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ItemDto>> getItem(@PathVariable Long id) {
        Optional<ItemDto> item = itemManagementFacade.getItemById(id);

        if (item.isPresent()) {
            return ResponseEntity.ok(ApiResponse.success(item.get()));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/my-items")
    public ResponseEntity<ApiResponse<List<ItemDto>>> getMyItems(Authentication authentication) {
        String userEmail = authentication.getName();
        List<ItemDto> items = itemManagementFacade.getItemsByUser(userEmail);
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<ItemDto>>> getActiveItems() {
        List<ItemDto> items = itemManagementFacade.getActiveItems();
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    @PutMapping("/{id}/claim")
    public ResponseEntity<ApiResponse<ItemDto>> claimItem(
            @PathVariable Long id,
            Authentication authentication) {

        String userEmail = authentication.getName();
        Optional<ItemDto> item = itemManagementFacade.claimItem(id, userEmail);

        if (item.isPresent()) {
            return ResponseEntity.ok(ApiResponse.success(item.get()));
        } else {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(new ApiError("ITEM_CANNOT_CLAIM", "Item not available for claiming", null)));
        }
    }

    @PutMapping("/{id}/return")
    public ResponseEntity<ApiResponse<ItemDto>> returnItem(
            @PathVariable Long id,
            Authentication authentication) {

        String userEmail = authentication.getName();
        Optional<ItemDto> item = itemManagementFacade.returnItem(id, userEmail);

        if (item.isPresent()) {
            return ResponseEntity.ok(ApiResponse.success(item.get()));
        } else {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(new ApiError("ITEM_CANNOT_RETURN", "Item cannot be returned", null)));
        }
    }
}
