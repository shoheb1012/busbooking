package com.quickbus.busbooking.controller;

import com.quickbus.busbooking.dto.AuthRequest;
import com.quickbus.busbooking.dto.AuthResponse;
import com.quickbus.busbooking.dto.LoginResponse;
import com.quickbus.busbooking.entity.User;
import com.quickbus.busbooking.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.AuthProvider;
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


    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody User user) {
        Optional<User> loggedIn = userService.loginUser(user.getEmailId(), user.getPassword());

        if (loggedIn.isPresent()) {
            return ResponseEntity.ok(new LoginResponse("Login successful!", loggedIn.get().getEmailId()));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new LoginResponse("Invalid credentials!", user.getEmailId()));
        }
    }

    @PostMapping("/login_user")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        String token = userService.login(request);
        return ResponseEntity.ok(new AuthResponse(token));
    }


}
