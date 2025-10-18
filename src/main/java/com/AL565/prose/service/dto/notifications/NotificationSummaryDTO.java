package com.AL565.prose.service.dto.notifications;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationSummaryDTO {
    private Long id;
    private String type;
    private String message;
    private String senderEmail;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
    private Long stageId;
    private Long candidatureId;
}