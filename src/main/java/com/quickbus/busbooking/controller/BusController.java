package com.quickbus.busbooking.controller;

import com.quickbus.busbooking.entity.Bus;
import com.quickbus.busbooking.entity.Route;
import com.quickbus.busbooking.entity.Schedule;
import com.quickbus.busbooking.service.BusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bus")
public class BusController {
    @Autowired
    private BusService busService;

    @PostMapping("/add-route")
    public ResponseEntity<Route> addRoute(@RequestBody Route route) {
        return ResponseEntity.ok(busService.addRoute(route));
    }

    @PostMapping("/add-bus")
    public ResponseEntity<Bus> addBus(@RequestBody Bus bus) {
        return ResponseEntity.ok(busService.addBus(bus));
    }

    @PostMapping("/add-schedule")
    public Schedule addSchedule(@RequestBody Schedule schedule) {
        return busService.addSchedule(schedule);
    }

    @GetMapping("/search")
    public List<Schedule> search(@RequestParam String source, @RequestParam String destination, @RequestParam String date) {  //format yyyy-mm-dd
        return busService.searchBuses(source, destination, LocalDate.parse(date));
    }

    @GetMapping("/getAllBus")
    public ResponseEntity<List<Bus>> getBusses() {
        return ResponseEntity.ok(busService.getAllBusses());
    }

    @GetMapping("/getAllRoute")
    public ResponseEntity<List<Route>> getAllRoute() {
        return ResponseEntity.ok(busService.getAllRoutes());
    }

    @GetMapping("/getBussesSchedule")
    public ResponseEntity<List<Schedule>> getBussesSchedule() {
        return ResponseEntity.ok(busService.getAllBussesSchedule());
    }

}


