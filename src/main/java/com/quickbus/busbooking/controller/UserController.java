package com.quickbus.busbooking.controller;

import com.quickbus.busbooking.dto.AuthRequest;
import com.quickbus.busbooking.dto.AuthResponse;
import com.quickbus.busbooking.dto.LoginResponse;
import com.quickbus.busbooking.entity.User;
import com.quickbus.busbooking.security.JwtUtil;
import com.quickbus.busbooking.service.UserService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.AuthProvider;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;
    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@RequestBody User user) {
        User savedUser = userService.registerUser(user);
        return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/get_all_users")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @PostMapping("/login_user")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        String token = userService.login(request);
        return ResponseEntity.ok(new AuthResponse(token));
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpServletRequest request) {
        try {
            // Extract token from Authorization header
            String token = extractTokenFromRequest(request);

            // Extract email from token
            String emailId = jwtUtil.extractEmail(token);

            // Validate token
            if (!jwtUtil.isTokenValid(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid or expired token");
            }

            // Get user details from service
            User user = userService.getUserByEmail(emailId);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User not found");
            }

            return ResponseEntity.ok(user);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Error fetching user details: " + e.getMessage());
        }
    }

    // Helper method to extract token from Authorization header
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        throw new RuntimeException("JWT token not found in request headers");
    }


}
