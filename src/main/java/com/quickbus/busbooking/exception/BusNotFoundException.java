package com.quickbus.busbooking.exception;

public class BusNotFoundException extends RuntimeException{
    public BusNotFoundException(String msg)
    {
        super(msg);
    }
}
