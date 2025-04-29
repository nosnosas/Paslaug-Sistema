package fullstackbackend.repository;

import fullstackbackend.model.Feedback;
import fullstackbackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByUser(User user);
}