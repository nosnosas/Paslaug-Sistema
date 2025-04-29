package fullstackbackend.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import fullstackbackend.model.Task;
import fullstackbackend.model.User;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByAssignedTo(User assignedTo);
    List<Task> findByCreatedBy(User createdBy);
    List<Task> findByStatus(String status);
    List<Task> findByDueDateBetween(LocalDateTime start, LocalDateTime end);
}