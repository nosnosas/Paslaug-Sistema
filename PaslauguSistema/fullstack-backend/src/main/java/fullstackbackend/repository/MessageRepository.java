package fullstackbackend.repository;

import fullstackbackend.model.Message;
import fullstackbackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findBySender(User sender);
    List<Message> findByRecipient(User recipient);
    List<Message> findByRecipientAndIsRead(User recipient, boolean isRead);
}