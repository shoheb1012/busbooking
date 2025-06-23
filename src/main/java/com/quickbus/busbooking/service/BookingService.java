package com.quickbus.busbooking.service;

import com.quickbus.busbooking.entity.Booking;
import com.quickbus.busbooking.entity.Schedule;
import com.quickbus.busbooking.entity.User;
import com.quickbus.busbooking.enums.Status;
import com.quickbus.busbooking.exception.BookingNotFoundException;
import com.quickbus.busbooking.exception.ScheduleNotFoundException;
import com.quickbus.busbooking.exception.SeatsNotAvailable;
import com.quickbus.busbooking.exception.UserNotAvailable;
import com.quickbus.busbooking.repository.BookingRepository;
import com.quickbus.busbooking.repository.ScheduleRepository;
import com.quickbus.busbooking.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingService {
    @Autowired
    BookingRepository bookingRepository;
    @Autowired
    UserRepository userRepository;
    @Autowired
    ScheduleRepository scheduleRepository;

    @Autowired
    EmailService emailService;

    @Transactional
    public Booking bookTicket(Long userId,Long scheduleId,int seats)
    {
        User user = userRepository.findById(userId).orElseThrow(()->new UserNotAvailable("User not found with Id :"+userId));
        Schedule schedule = scheduleRepository.findScheduleById(scheduleId).orElseThrow(() -> new ScheduleNotFoundException("Bus not found with Id " + scheduleId));
        if (schedule.getAvailableSeats() < seats) {
            throw new SeatsNotAvailable("Not enough seats available.");
        }


        schedule.setAvailableSeats(schedule.getAvailableSeats() - seats);
        scheduleRepository.save(schedule);

        double totalFare = schedule.getFare() * seats;

        Booking booking = Booking.builder()
                .user(user)
                .schedule(schedule)
                .seatsBooked(seats)
                .totalFare(totalFare)
                .status(Status.BOOKED)
                .bookingTime(LocalDateTime.now())
                .build();

        Booking save = bookingRepository.save(booking);
        emailService.sendBookingConfirmation(save);
        return save;
    }

    public String cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow();

        if (booking.getStatus().equals(Status.CANCELLED)) {
            return "Booking is already cancelled.";
        }

        booking.setStatus(Status.CANCELLED);


        Schedule schedule = booking.getSchedule();
        schedule.setAvailableSeats(schedule.getAvailableSeats() + booking.getSeatsBooked());

        scheduleRepository.save(schedule);
        Booking save = bookingRepository.save(booking);
        emailService.sendCancellationMail(save);
        return "Booking cancelled successfully.";
    }

    public List<Booking> getBookingsByUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(()->new BookingNotFoundException("No booking found for user Id "+userId));
        return bookingRepository.findByUser(user);
    }


}
