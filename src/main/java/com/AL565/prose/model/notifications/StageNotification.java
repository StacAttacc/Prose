package com.AL565.prose.model.notifications;

import com.AL565.prose.model.Stage;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StageNotification extends Notification {
    private Stage stage;
}
