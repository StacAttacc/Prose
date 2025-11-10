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
    private String message;
    private String senderEmail;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
    private LocalDateTime secondaryRecipientReadAt;
    private Long stageId;
    private Long cvId;
    private Long candidatureId;
    private Long candidatureDecisionId;
    private Long candidatureResponseId;
    private Long etudiantId;
    private Long convocation;

    public static NotificationSummaryDTO toDTO(Notification n) {
        if (n == null) return null;

        Long stageId = null;
        Long candidatureId = null;
        Long candidatureDecisionId = null;
        Long cvId = null;
        Long etudiantId = null;
        Long convocation = null;

        switch (n) {
            case StageNotification sn -> {
                if (sn.getStage() != null) stageId = sn.getStage().getId();
            }
            case CandidatureDecisionNotification cdn -> {
                if (cdn.getCandidatureDecisionId() != null) {
                    candidatureDecisionId = cdn.getCandidatureDecisionId();
                    etudiantId = cdn.getCandidatureDecisionEtudiantId();
                }
            }
            case PostulationNotification pn -> {
                Long candidaturePostulationId = pn.getCandidaturePostulationId();
                Long candidatueEtudiantId = pn.getEtudiantPostulationId();
                Long candidatureStageId = pn.getStagePostulationId();
                if (candidaturePostulationId != null) {
                    candidatureId = candidaturePostulationId;
                    if (candidatureStageId != null) stageId = candidatureStageId;
                    if (candidatueEtudiantId != null) etudiantId = candidatueEtudiantId;
                }
            }
            case EmployeurResponseNotification ern -> {
                Long candidatureResponseId = ern.getCandidatureResponseId();
                Long stageResponseId = ern.getStageResponseId();
                Long etudiantResponseId = ern.getEtudiantResponseId();
                if (candidatureResponseId != null) {
                    candidatureId = candidatureResponseId;
                    if (stageResponseId != null) stageId = stageResponseId;
                    if (etudiantResponseId != null) etudiantId = etudiantResponseId;
                }
            }
            case GestionnaireCvNotification gcn -> {
                if (gcn.getCv() != null) {
                    cvId = gcn.getCv().getId();
                }
            }
            case ConvocationNotification cn -> {
                Long candidatureConvocationId = cn.getCandidatureConvocationId();
                if (candidatureConvocationId != null) {
                    convocation = candidatureConvocationId;
                    etudiantId = cn.getEtudiantConvocationId();
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
                .convocation(convocation)
                .candidatureDecisionId(candidatureDecisionId)
                .build();
    }
}