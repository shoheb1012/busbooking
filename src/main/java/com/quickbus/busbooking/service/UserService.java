package com.quickbus.busbooking.service;

import com.quickbus.busbooking.entity.User;
import com.quickbus.busbooking.exception.EmailAlreadyExistsException;
import com.quickbus.busbooking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    UserRepository userRepository;

    public User registerUser(User user) {
        Optional<User> user1 = userRepository.findByEmailId(user.getEmailId());
        if (user1.isPresent()) {
            throw new EmailAlreadyExistsException("Email already registered!");
        }
        return userRepository.save(user);
    }


    public Optional<User> login(String emailId, String password) {
        Optional<User> user = userRepository.findByEmailId(emailId);
        if (user.isPresent() && user.get().getPassword().equals(password)) {
            return user;
        }
        return Optional.empty();
    }

}
