package com.quickbus.busbooking.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.*;
import lombok.*;

@Entity(name = "user")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    @Column(unique = true)
    private String emailId;
    private Long phone;
    private String password;
}
