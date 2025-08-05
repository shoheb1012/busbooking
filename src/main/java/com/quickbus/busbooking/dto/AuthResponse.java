package com.quickbus.busbooking.dto;

import com.quickbus.busbooking.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
//
@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;


}
