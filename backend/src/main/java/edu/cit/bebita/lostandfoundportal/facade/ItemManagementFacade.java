package edu.cit.bebita.lostandfoundportal.facade;

import edu.cit.bebita.lostandfoundportal.adapter.EntityDtoAdapter;
import edu.cit.bebita.lostandfoundportal.dto.CreateItemRequest;
import edu.cit.bebita.lostandfoundportal.dto.ItemDto;
import edu.cit.bebita.lostandfoundportal.entity.Item;
import edu.cit.bebita.lostandfoundportal.entity.User;
import edu.cit.bebita.lostandfoundportal.factory.ItemFactory;
import edu.cit.bebita.lostandfoundportal.repository.ItemRepository;
import edu.cit.bebita.lostandfoundportal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ItemManagementFacade {

    private final ItemFactory itemFactory;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final EntityDtoAdapter adapter;

    @Autowired
    public ItemManagementFacade(ItemFactory itemFactory, ItemRepository itemRepository, UserRepository userRepository, EntityDtoAdapter adapter) {
        this.itemFactory = itemFactory;
        this.itemRepository = itemRepository;
        this.userRepository = userRepository;
        this.adapter = adapter;
    }

    @Transactional
    public ItemDto createItem(CreateItemRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Item item = itemFactory.createItem(request, user);
        Item savedItem = itemRepository.save(item);

        return adapter.adapt(savedItem);
    }

    public List<ItemDto> searchItems(String keyword, String category, String status) {
        List<Item> items;

        if (keyword != null && !keyword.trim().isEmpty()) {
            items = itemRepository.searchByKeyword(keyword);
        } else if (category != null && !category.trim().isEmpty()) {
            items = itemRepository.findByCategory(category);
        } else if (status != null && !status.trim().isEmpty()) {
            items = itemRepository.findByStatus(Item.ItemStatus.valueOf(status.toUpperCase()));
        } else {
            items = itemRepository.findAll();
        }

        return items.stream()
                .map(adapter::adapt)
                .collect(Collectors.toList());
    }

    @Transactional
    public Optional<ItemDto> claimItem(Long itemId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Optional<Item> itemOpt = itemRepository.findById(itemId);
        if (itemOpt.isPresent()) {
            Item item = itemOpt.get();
            if (item.getStatus() == Item.ItemStatus.ACTIVE) {
                item.setStatus(Item.ItemStatus.CLAIMED);
                item.setClaimedBy(user);
                Item savedItem = itemRepository.save(item);
                return Optional.of(adapter.adapt(savedItem));
            }
        }
        return Optional.empty();
    }

    @Transactional
    public Optional<ItemDto> returnItem(Long itemId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Optional<Item> itemOpt = itemRepository.findById(itemId);
        if (itemOpt.isPresent()) {
            Item item = itemOpt.get();
            // Only allow return if the user is the one who posted the item or an admin
            if (item.getUser().equals(user) || "ADMIN".equals(user.getRole())) {
                item.setStatus(Item.ItemStatus.RETURNED);
                Item savedItem = itemRepository.save(item);
                return Optional.of(adapter.adapt(savedItem));
            }
        }
        return Optional.empty();
    }

    public Optional<ItemDto> getItemById(Long itemId) {
        return itemRepository.findById(itemId)
                .map(adapter::adapt);
    }

    public List<ItemDto> getItemsByUser(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return itemRepository.findByUserId(user.getId()).stream()
                .map(adapter::adapt)
                .collect(Collectors.toList());
    }

    public List<ItemDto> getActiveItems() {
        return itemRepository.findByStatus(Item.ItemStatus.ACTIVE).stream()
                .map(adapter::adapt)
                .collect(Collectors.toList());
    }
}