package com.quickbus.busbooking.exception;

public class EmailAlreadyExistsException extends RuntimeException{
    public EmailAlreadyExistsException(String msg)
    {
        super(msg);
    }
}
