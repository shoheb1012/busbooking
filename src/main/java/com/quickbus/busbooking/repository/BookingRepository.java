package com.quickbus.busbooking.repository;

import com.quickbus.busbooking.entity.Booking;
import com.quickbus.busbooking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking,Long> {
    List<Booking> findByUser(User user);
}
