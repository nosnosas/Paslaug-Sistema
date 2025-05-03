package fullstackbackend;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import fullstackbackend.model.Auth;
import fullstackbackend.model.User;
import fullstackbackend.repository.AuthRepository;
import fullstackbackend.repository.UserRepository;

@SpringBootApplication
public class FullstackBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(FullstackBackendApplication.class, args);
    }

    @Bean
    CommandLineRunner init(AuthRepository authRepository, UserRepository userRepository) {
        return args -> {
            // Check if admin exists, if not create it
            if (!authRepository.existsByUsername("admin")) {
                System.out.println("Creating admin user...");

                Auth auth = new Auth();
                auth.setUsername("admin");
                auth.setPassword("admin");
                auth.setRole("ADMIN");
                authRepository.save(auth);

                User user = new User();
                user.setUsername("admin");
                user.setName("Administrator");
                user.setEmail("admin@example.com");
                user.setPassword("admin");
                user.setRole("ADMIN");
                userRepository.save(user);

                System.out.println("Admin user created successfully");
            }
        };
    }
}