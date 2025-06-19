package com.quickbus.busbooking.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Schedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate travelDate;

    private LocalTime departureTime;
    private LocalTime arrivalTime;

    private String journeyDuration;

    private int availableSeats;
    private Double fare;


    @ManyToOne
    private Bus bus;

    @ManyToOne
    private Route route;
}
