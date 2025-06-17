package com.quickbus.busbooking.exception;

public class RouteNotFoundException extends RuntimeException{
    public RouteNotFoundException(String msg)
    {
        super(msg);
    }
}
