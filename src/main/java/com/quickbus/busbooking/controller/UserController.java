package com.quickbus.busbooking.controller;

import com.quickbus.busbooking.dto.AuthRequest;
import com.quickbus.busbooking.dto.AuthResponse;
import com.quickbus.busbooking.dto.LoginResponse;
import com.quickbus.busbooking.entity.User;
import com.quickbus.busbooking.service.UserService;
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


}
