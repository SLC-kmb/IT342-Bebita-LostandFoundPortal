package edu.cit.bebita.lostandfoundportal.repository;

import edu.cit.bebita.lostandfoundportal.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {

    List<Item> findByUserId(Long userId);

    List<Item> findByStatus(Item.ItemStatus status);

    List<Item> findByType(Item.ItemType type);

    List<Item> findByCategory(String category);

    @Query("SELECT i FROM Item i WHERE " +
           "LOWER(i.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(i.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(i.location) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Item> searchByKeyword(@Param("keyword") String keyword);

    @Query("SELECT i FROM Item i WHERE i.status = :status AND i.type = :type")
    List<Item> findByStatusAndType(@Param("status") Item.ItemStatus status, @Param("type") Item.ItemType type);
}