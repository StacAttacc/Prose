package com.AL565.prose.service.dto.notifications;

import com.AL565.prose.model.Candidature;
import com.AL565.prose.model.notifications.*;
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
    private LocalDateTime secondaryRecipientReadAt;
    private Long stageId;
    private Long cvId;
    private Long candidatureId;
    private Long etudiantId;

    public static NotificationSummaryDTO toDTO(Notification n) {
        if (n == null) return null;

        Long stageId = null;
        Long candidatureId = null;
        Long cvId = null;
        Long etudiantId = null;

        switch (n) {
            case StageNotification sn -> {
                if (sn.getStage() != null) stageId = sn.getStage().getId();
            }
            case PostulationNotification pn -> {
                Candidature c = pn.getCandidature();
                if (c != null) {
                    candidatureId = c.getId();
                    if (c.getStage() != null) stageId = c.getStage().getId();
                    if (c.getEtudiant() != null) etudiantId = c.getEtudiant().getId();
                }
            }
            case GestionnaireCvNotification gcn -> {
                if (gcn.getCv() != null) {
                    cvId = gcn.getCv().getId();
                }
            }
            default -> {
            }
        }

        return NotificationSummaryDTO.builder()
                .id(n.getId())
                .type(n.getType() != null ? n.getType().getDisplayName() : null)
                .message(n.getMessage())
                .createdAt(n.getCreatedAt())
                .readAt(n.getFirstRecipientReadAt())
                .secondaryRecipientReadAt(n.getSecondRecipientReadAt())
                .stageId(stageId)
                .candidatureId(candidatureId)
                .etudiantId(etudiantId)
                .cvId(cvId)
                .build();
    }
}