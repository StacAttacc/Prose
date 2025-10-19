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

    public static NotificationsResponseDTO toDTO(List<NotificationGroupDTO> groups) {
        int total = 0;
        if (groups != null) {
            for (NotificationGroupDTO g : groups) {
                total += g != null ? g.getCount() : 0;
            }
        }
        return new NotificationsResponseDTO(groups, total);
    }
}
