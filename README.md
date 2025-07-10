Bus Booking System - Problem Statement
Problem Statement
Project Title:
QuickBus - A RESTful Bus Ticket Booking System
Objective:
Build a backend system that allows users to search for buses, view schedules, book/cancel tickets, and
manage bookings - similar to platforms like RedBus or Goibibo, but only via REST APIs (no frontend).
User Roles:
1. User (Passenger)
2. Admin (Optional for future scope)
Functional Requirements:
User Module:
- Register a new user
- Login (authentication)
- View booking history
- Cancel a ticket
Bus Booking Module:
- Search buses by source, destination, and date
- View available seats
- Book tickets for selected seats
- Return confirmation with ticket ID, bus details, and seat numbers
Schedule Management:
- Each bus has schedules (example: runs on June 8, 9, etc.)
- Predefined schedules or admin-configured
Bus Booking System - Problem Statement
Database Tables:
- User: user_id, name, email, password, phone
- Bus: bus_id, name, type, seat_count, operator
- Route: route_id, source, destination
- Schedule: schedule_id, bus_id, route_id, date, available_seats
- Booking: booking_id, user_id, schedule_id, seats_booked, booking_date, status
Sample APIs:
- POST /api/users/register - Register user
- POST /api/users/login - Login user
- GET /api/buses/search?source=Hyd&dest=Pune&date=2025-06-10 - Search buses
- POST /api/bookings - Book a ticket
- GET /api/bookings/user/{id} - View bookings
- DELETE /api/bookings/{bookingId} - Cancel booking
Security (Advanced Scope):
- Basic login system
- JWT authentication (optional)
