package com.AL565.prose.service.dto;

import com.AL565.prose.model.notifications.Notification;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StageNotificationDTO {
     List<Notification> stageNotifications;
     int count;
}
