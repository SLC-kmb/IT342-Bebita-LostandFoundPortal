package edu.cit.bebita.lostandfoundportal.features.notifications.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.cit.bebita.lostandfoundportal.features.auth.model.User;
import edu.cit.bebita.lostandfoundportal.features.notifications.model.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    long countByUserAndIsReadFalse(User user);
    
    @org.springframework.transaction.annotation.Transactional
    void deleteByUser(User user);
}
