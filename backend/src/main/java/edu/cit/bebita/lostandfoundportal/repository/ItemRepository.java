package edu.cit.bebita.lostandfoundportal.repository;

import edu.cit.bebita.lostandfoundportal.entity.Item;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ItemRepository extends JpaRepository<Item, Long> {

    List<Item> findByTypeAndStatus(String type, String status);

    List<Item> findByType(String type);

    @Query("SELECT i FROM Item i WHERE i.type = :type AND i.status = 'active'")
    List<Item> findActiveItemsByType(String type);
}