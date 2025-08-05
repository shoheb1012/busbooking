package com.quickbus.busbooking.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@AllArgsConstructor
@Data
@RequiredArgsConstructor
public class LoginResponse {
    private String message;
    private String email;

}
