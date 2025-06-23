package com.quickbus.busbooking.controller;

import com.quickbus.busbooking.entity.Booking;
import com.quickbus.busbooking.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    BookingService bookingService;

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @PostMapping("/book")
    public ResponseEntity<Booking> bookTicket(@RequestParam Long userId, @RequestParam Long scheduleId, @RequestParam int seats) {
        return ResponseEntity.ok(bookingService.bookTicket(userId, scheduleId, seats));
    }

    @PreAuthorize("hasRole('USER')")
    @DeleteMapping("/cancel/{bookingId}")
    public String cancelBooking(@PathVariable Long bookingId) {
        return bookingService.cancelBooking(bookingId);
    }

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/user/{userId}")
    public List<Booking> getBookings(@PathVariable Long userId) {
        return bookingService.getBookingsByUser(userId);
    }
}
