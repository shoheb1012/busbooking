package com.quickbus.busbooking.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity(name = "route")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Route {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String source;

    private String destination;
}

