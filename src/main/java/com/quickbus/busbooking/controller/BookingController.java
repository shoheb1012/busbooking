package com.quickbus.busbooking.controller;

import com.quickbus.busbooking.entity.Booking;
import com.quickbus.busbooking.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    // Updated Controller
    @PreAuthorize("hasRole('USER')or hasRole('ADMIN')")
    @PostMapping("/cancel-seats/{bookingId}")
    public ResponseEntity<Map<String, Object>> cancelSeats(@PathVariable Long bookingId, @RequestBody Map<String, Integer> request) {

        try {
            Integer seatsToCancel = request.get("seatsToCancel");

            if (seatsToCancel == null || seatsToCancel <= 0) {
                throw new IllegalArgumentException("Invalid number of seats to cancel");
            }

            String result = bookingService.cancelSeats(bookingId, seatsToCancel);

            Map<String, Object> response = new HashMap<>();
            response.put("message", result);
            response.put("status", "success");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            errorResponse.put("status", "error");

            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Keep the full cancellation endpoint too
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @DeleteMapping("/cancel/{bookingId}")
    public ResponseEntity<Map<String, String>> cancelBooking(@PathVariable Long bookingId) {
        try {
            String result = bookingService.cancelBooking(bookingId);
            Map<String, String> response = new HashMap<>();
            response.put("message", result);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/user/{userId}")
    public List<Booking> getBookings(@PathVariable Long userId) {
        return bookingService.getBookingsByUser(userId);
    }
}
