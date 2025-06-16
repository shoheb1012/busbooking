package com.quickbus.busbooking.repository;

import com.quickbus.busbooking.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    List<Schedule> findByRouteSourceAndRouteDestinationAndTravelDate(String source, String destination, LocalDate travelDate);
}

