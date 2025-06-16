package com.quickbus.busbooking.repository;

import com.quickbus.busbooking.entity.Route;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RouteRepository extends JpaRepository<Route,Long> {
}
