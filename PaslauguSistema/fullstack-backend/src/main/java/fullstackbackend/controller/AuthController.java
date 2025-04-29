package fullstackbackend.controller;

import fullstackbackend.dto.AuthResponse;
import fullstackbackend.dto.LoginRequest;
import fullstackbackend.dto.SignupRequest;
import fullstackbackend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin("http://localhost:3000")
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;
    
    @PostMapping("/signup")
    public AuthResponse signup(@RequestBody SignupRequest signupRequest) {
        return authService.signup(signupRequest);
    }
    
    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest loginRequest) {
        return authService.login(loginRequest);
    }
}