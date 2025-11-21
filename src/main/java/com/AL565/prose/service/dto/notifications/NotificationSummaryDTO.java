package com.AL565.prose.service.dto.notifications;

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
    private String messageFR;
    private String messageEN;
    private String senderEmail;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
    private LocalDateTime secondaryRecipientReadAt;
    private Long stageId;
    private Long cvId;
    private Long candidatureId;
    private Long etudiantId;
    private Long convocation;

    public static NotificationSummaryDTO toDTO(Notification n) {
        if (n == null) return null;

        Long stageId = null;
        Long candidatureId = null;
        Long cvId = null;
        Long etudiantId = null;

        switch (n) {
            case CreationStageNotification sn -> stageId = sn.getStageId();
            case NouveauCvNotification gcn -> cvId = gcn.getCvId();
            case DemandeApprobationStageNotification dasn -> stageId = dasn.getStageId();
            case CandidatureDecisionNotification cdn -> {
                    candidatureId = cdn.getCandidatureId();
                    etudiantId = cdn.getEtudiantId();
            }
            case PostulationNotification pn -> {
                    candidatureId = pn.getCandidatureId();
                    stageId = pn.getStageId();
                    etudiantId = pn.getEtudiantId();
            }
            case EtudiantOffreDecisionNotification ern -> {
                    candidatureId = ern.getCandidatureId();
                    stageId = ern.getStageId();
                    etudiantId = ern.getEtudiantId();
            }
            case ConvocationNotification cn -> {
                    candidatureId = cn.getCandidatureId();
                    etudiantId = cn.getEtudiantId();
            }
            case SignatureEntenteNotification sen -> {
                    candidatureId = sen.getCandidatureId();
                    stageId = sen.getStageId();
            }
            default -> {
            }
        }

        return NotificationSummaryDTO.builder()
                .id(n.getId())
                .type(n.getType() != null ? n.getType().getDisplayName() : null)
                .messageFR(n.getMessageFR())
                .messageEN(n.getMessageEN())
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