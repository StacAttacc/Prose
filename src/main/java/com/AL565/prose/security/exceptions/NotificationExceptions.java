package com.AL565.prose.security.exceptions;

public class NotificationExceptions {
    public static class NotificationCreationException extends Exception {
        public NotificationCreationException() {
            super("Erreur lors de la création de la notification");
        }
    }
}
