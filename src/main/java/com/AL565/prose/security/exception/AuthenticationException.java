package com.AL565.prose.security.exception;

import org.springframework.http.HttpStatus;

public class AuthenticationException extends APIException {
    public AuthenticationException(HttpStatus status, String message) {
        super(status, message);
    }
}
