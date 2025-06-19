package com.quickbus.busbooking.exception;

public class SeatsNotAvailable extends RuntimeException{
    public SeatsNotAvailable(String msg)
    {
        super(msg);
    }
}
