package com.quickbus.busbooking;

import com.quickbus.busbooking.entity.User;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BusBookingSystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(BusBookingSystemApplication.class, args);
		System.out.println("Bus Booking API is running!");

	}

}
