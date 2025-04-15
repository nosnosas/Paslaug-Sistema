package com.saadbaig.fullstackbackend.repository;

import com.saadbaig.fullstackbackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // Custom method to find user by email
    Optional<User> findByEmail(String email);
}