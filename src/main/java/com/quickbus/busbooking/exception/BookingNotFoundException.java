package com.quickbus.busbooking.exception;

public class BookingNotFoundException extends RuntimeException{

    public BookingNotFoundException(String msg)
    {
        super(msg);
    }
}
