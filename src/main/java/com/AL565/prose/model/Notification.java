package com.AL565.prose.model;


import java.time.LocalDateTime;

public class Notification {
    private LocalDateTime readAt;
    private LocalDateTime readByGestionnaireAt;
    private LocalDateTime createdAt;
    private ProseUser recipient;
    private ProseUser sender;
    private String message;
}
