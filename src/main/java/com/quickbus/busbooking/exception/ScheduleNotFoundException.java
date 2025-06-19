package com.quickbus.busbooking.exception;

public class ScheduleNotFoundException extends RuntimeException{
    public ScheduleNotFoundException(String msg)
    {
        super(msg);
    }
}
