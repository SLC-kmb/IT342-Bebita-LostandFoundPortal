package edu.cit.bebita.lostandfoundportal.features.items.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import edu.cit.bebita.lostandfoundportal.features.items.model.Item;

public interface ItemRepository extends JpaRepository<Item, Long> {

    List<Item> findByTypeAndStatus(String type, String status);

    List<Item> findByType(String type);

    List<Item> findByStatus(String status);

    long countByStatus(String status);

    long countByType(String type);

    @Query("SELECT i FROM Item i WHERE i.type = :type AND i.status = 'active'")
    List<Item> findActiveItemsByType(String type);

    List<Item> findByReportedBy(edu.cit.bebita.lostandfoundportal.features.auth.model.User reportedBy);
    
    List<Item> findByClaimedByUser(edu.cit.bebita.lostandfoundportal.features.auth.model.User claimedByUser);
}