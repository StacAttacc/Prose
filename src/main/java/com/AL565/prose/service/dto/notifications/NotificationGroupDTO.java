package com.AL565.prose.service.dto.notifications;

import com.AL565.prose.model.notifications.Notification;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationGroupDTO {
    private String typeKey;
    private List<NotificationSummaryDTO> items;
    private int count;

    public static NotificationGroupDTO toDTO(String typeKey, List<? extends Notification> domainList) {
        List<NotificationSummaryDTO> items = domainList == null
                ? new ArrayList<>()
                : domainList.stream().map(NotificationSummaryDTO::toDTO).collect(Collectors.toList());
        return new NotificationGroupDTO(typeKey, items, items.size());
    }
}
