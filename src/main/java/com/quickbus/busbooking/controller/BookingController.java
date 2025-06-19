package com.quickbus.busbooking.controller;

import com.quickbus.busbooking.entity.Booking;
import com.quickbus.busbooking.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    BookingService bookingService;

    @PostMapping("/book")
    public ResponseEntity<Booking> bookTicket(@RequestParam Long userId, @RequestParam Long scheduleId, @RequestParam int seats) {
        return ResponseEntity.ok(bookingService.bookTicket(userId, scheduleId, seats));
    }

    @DeleteMapping("/cancel/{bookingId}")
    public String cancelBooking(@PathVariable Long bookingId) {
        return bookingService.cancelBooking(bookingId);
    }

    @GetMapping("/user/{userId}")
    public List<Booking> getBookings(@PathVariable Long userId) {
        return bookingService.getBookingsByUser(userId);
    }
}
