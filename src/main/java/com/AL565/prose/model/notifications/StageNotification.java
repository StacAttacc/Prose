package com.AL565.prose.model.notifications;

import com.AL565.prose.model.Stage;

import java.time.LocalDateTime;

public class StageNotification extends Notification {
    private Stage stage;
    private LocalDateTime gestionnaireReadAt;
}
