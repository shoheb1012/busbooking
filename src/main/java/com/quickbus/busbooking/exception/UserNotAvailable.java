package com.quickbus.busbooking.exception;

public class UserNotAvailable extends RuntimeException{

    public UserNotAvailable(String msg)
    {
        super(msg);
    }
}
