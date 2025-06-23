package com.quickbus.busbooking.service;

import com.quickbus.busbooking.dto.SearchRequest;
import com.quickbus.busbooking.entity.Bus;
import com.quickbus.busbooking.entity.Route;
import com.quickbus.busbooking.entity.Schedule;
import com.quickbus.busbooking.enums.SortType;
import com.quickbus.busbooking.exception.BusNotFoundException;
import com.quickbus.busbooking.exception.RouteNotFoundException;
import com.quickbus.busbooking.repository.BusRepository;
import com.quickbus.busbooking.repository.RouteRepository;
import com.quickbus.busbooking.repository.ScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;

@Service
public class BusService {

    @Autowired
    private BusRepository busRepo;
    @Autowired
    private RouteRepository routeRepo;
    @Autowired
    private ScheduleRepository scheduleRepo;

    public Route addRoute(Route route) {
        return routeRepo.save(route);
    }

    public Bus addBus(Bus bus) {
        return busRepo.save(bus);
    }

    public Schedule addSchedule(Schedule schedule) {
        Long busId = schedule.getBus().getId();
        Long routeId = schedule.getRoute().getId();

        Bus bus = busRepo.findById(busId)
                .orElseThrow(() -> new BusNotFoundException("Bus not found with id: " + busId));

        Route route = routeRepo.findById(routeId)
                .orElseThrow(() -> new RouteNotFoundException("Route not found with id: " + routeId));


        LocalDate travelDate = schedule.getTravelDate();
        LocalTime departureTime = schedule.getDepartureTime();
        LocalTime arrivalTime = schedule.getArrivalTime();

        LocalDateTime departureDateTime = LocalDateTime.of(travelDate, departureTime);
        LocalDateTime arrivalDateTime;

        if (arrivalTime.isBefore(departureTime)) {
            // Arrival is next day
            arrivalDateTime = LocalDateTime.of(travelDate.plusDays(1), arrivalTime);
        } else {
            arrivalDateTime = LocalDateTime.of(travelDate, arrivalTime);
        }

        Duration duration = Duration.between(departureDateTime, arrivalDateTime);
        long hours = duration.toHours();
        long minutes = duration.toMinutes() % 60;

        String durationStr = hours + "h " + minutes + "m";
        schedule.setJourneyDuration(durationStr);
        schedule.setBus(bus);
        schedule.setRoute(route);

        return scheduleRepo.save(schedule);
    }


    public List<Schedule> searchBuses(SearchRequest request) {
        List<Schedule> schedules = scheduleRepo.findSchedulesBySourceToDestinationDate(request.getSource(), request.getDestination(), request.getTravelDate());

        if (schedules.isEmpty()) {
            throw new BusNotFoundException("oops Busses not Available for this route ");
        }
        if (request.getBusType() != null) {
            schedules = schedules.stream().filter(s -> s.getBus().getBusType().name().equalsIgnoreCase(request.getBusType().name())).toList();
        }


        if (SortType.FARE.equals(request.getSortBy())) {
            schedules.sort(Comparator.comparingDouble(Schedule::getFare));
        } else if (SortType.DEPARTURE_TIME.equals(request.getSortBy())) {
            schedules.sort(Comparator.comparing(Schedule::getDepartureTime));
        }


        schedules = schedules.stream().filter(s -> s.getAvailableSeats() > 0).toList();

        return schedules;
    }

    public List<Bus> getAllBusses() {
        return busRepo.findAll();
    }

    public List<Route> getAllRoutes() {
        return routeRepo.findAll();
    }

    public List<Schedule> getAllBussesSchedule() {
        return scheduleRepo.findAll();
    }


}

