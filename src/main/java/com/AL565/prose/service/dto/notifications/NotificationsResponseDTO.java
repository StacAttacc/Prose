package com.AL565.prose.service.dto.notifications;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationsResponseDTO {
    private List<NotificationGroupDTO> groups;
    private int totalCount;
}
