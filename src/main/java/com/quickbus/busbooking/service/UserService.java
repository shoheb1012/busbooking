package com.quickbus.busbooking.service;

import com.quickbus.busbooking.dto.AuthRequest;
import com.quickbus.busbooking.entity.User;
import com.quickbus.busbooking.enums.Role;
import com.quickbus.busbooking.exception.EmailAlreadyExistsException;
import com.quickbus.busbooking.exception.UserNotAvailable;
import com.quickbus.busbooking.repository.UserRepository;
import com.quickbus.busbooking.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    public User registerUser(User user) {
        Optional<User> user1 = userRepository.findByEmailId(user.getEmailId());
        if (user1.isPresent()) {
            throw new EmailAlreadyExistsException("Email already registered!");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole(Role.USER);

        return userRepository.save(user);
    }
    public String login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        User user = userRepository.findByEmailId(request.getEmail()).orElseThrow(()-> new UserNotAvailable("User not found"));
        return jwtUtil.generateToken(user.getEmailId(), user.getRole().name());
    }

    public Optional<User> loginUser(String emailId, String password) {
        Optional<User> user = userRepository.findByEmailId(emailId);
        if (user.isPresent() && user.get().getPassword().equals(password)) {
            return user;
        }
        return Optional.empty();
    }

}
