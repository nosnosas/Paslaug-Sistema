package com.saadbaig.fullstackbackend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import jakarta.persistence.Table;

@Entity
@Table(name = "user") // Explicitly map to 'users' table
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Use for MySQL auto-increment
    private Long id;

    @Column(nullable = true) // Username can be null
    private String username;

    @Column(nullable = false, unique = true) // Email is required and must be unique
    private String email;

    @Column(nullable = false) // Password is required
    private String password;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", username='" + username + '\'' +
                ", email='" + email + '\'' +
                '}';
    }
}