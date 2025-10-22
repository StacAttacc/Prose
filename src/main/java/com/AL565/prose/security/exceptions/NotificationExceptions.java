package com.AL565.prose.security.exceptions;

public class NotificationExceptions {
    public static class NotificationCreationException extends Exception {
        public NotificationCreationException() {
            super("Erreur lors de la création de la notification");
        }
    }

    public static class NotificationFetchException extends Exception {
        public NotificationFetchException() {
            super("Erreur lors de la récupération des notifications");
        }
    }
}
