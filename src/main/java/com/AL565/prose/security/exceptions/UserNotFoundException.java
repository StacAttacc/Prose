package com.AL565.prose.security.exceptions;

import org.springframework.http.HttpStatus;

public class UserNotFoundException extends APIException {
        public UserNotFoundException() {
            super(HttpStatus.NOT_FOUND,"userNotFound");

        }
}
