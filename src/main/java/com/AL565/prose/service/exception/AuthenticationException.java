package com.AL565.prose.service.exception;

import org.springframework.http.HttpStatus;

public class AuthenticationException extends APIException {
    public AuthenticationException(HttpStatus status, String message) {
        super(status, message);
    }
}
