package com.quickbus.busbooking.entity;

import com.quickbus.busbooking.enums.BusType;
import jakarta.persistence.*;
import lombok.*;

@Entity(name ="bus")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String busName;

    @Enumerated(EnumType.STRING)
    private BusType busType;

    private int totalSeats;
}
