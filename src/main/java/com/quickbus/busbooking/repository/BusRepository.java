package com.quickbus.busbooking.repository;

import com.quickbus.busbooking.entity.Bus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BusRepository extends JpaRepository<Bus,Long> {
}
