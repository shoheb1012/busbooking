package com.quickbus.busbooking.repository;

import com.quickbus.busbooking.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    List<Schedule> findByRouteSourceAndRouteDestinationAndTravelDate(String source, String destination, LocalDate travelDate);

    @Query("SELECT s FROM Schedule s WHERE s.route.source = :source AND s.route.destination = :destination AND s.travelDate = :date")
    List<Schedule> findSchedulesBySourceToDestinationDate(@Param("source") String source, @Param("destination") String destination, @Param("date") LocalDate date);

}

