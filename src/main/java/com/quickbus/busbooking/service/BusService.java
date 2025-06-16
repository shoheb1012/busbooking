package com.quickbus.busbooking.service;

import com.quickbus.busbooking.entity.Bus;
import com.quickbus.busbooking.entity.Route;
import com.quickbus.busbooking.entity.Schedule;
import com.quickbus.busbooking.repository.BusRepository;
import com.quickbus.busbooking.repository.RouteRepository;
import com.quickbus.busbooking.repository.ScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
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
                .orElseThrow(() -> new RuntimeException("Bus not found with id: " + busId));

        Route route = routeRepo.findById(routeId)
                .orElseThrow(() -> new RuntimeException("Route not found with id: " + routeId));

        schedule.setBus(bus);
        schedule.setRoute(route);

        return scheduleRepo.save(schedule);
    }

    public List<Schedule> searchBuses(String source, String destination, LocalDate date) {
        return scheduleRepo.findByRouteSourceAndRouteDestinationAndTravelDate(source, destination, date);
    }
}

