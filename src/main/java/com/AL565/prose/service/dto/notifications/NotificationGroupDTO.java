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
public class NotificationGroupDTO {
    private String typeKey;
    private List<NotificationSummaryDTO> items;
    private int count;
}
