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
    private Long candidatureDecisionId;
    private Long candidatureResponseId;
    private Long candidaturePostulationId;
    private Long etudiantOffreDecisionId;
    private Long signatureEntenteCandidatureId;
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
        Long etudiantOffreDecisionId = null;
        Long candidaturePostulationId = null;
        Long signatureEntenteCandidatureId = null;

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
                if (pn.getCandidaturePostulationId() != null) {
                    candidaturePostulationId = pn.getCandidaturePostulationId();
                    stageId = pn.getStagePostulationId();
                    etudiantId = pn.getEtudiantPostulationId();
                }
            }
            case EtudiantOffreDecisionNotification ern -> {
                Long candidatureResponseId = ern.getCandidatureResponseId();
                Long stageResponseId = ern.getStageResponseId();
                Long etudiantResponseId = ern.getEtudiantResponseId();
                if (candidatureResponseId != null) {
                    etudiantOffreDecisionId = candidatureResponseId;
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
            case SignatureEntenteNotification sen -> {
                if (sen.getSignatureEntenteCandidatureId() != null) {
                    signatureEntenteCandidatureId = sen.getSignatureEntenteCandidatureId();
                    stageId = sen.getSignatureEntenteStageId();
                }
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
                .convocation(convocation)
                .candidatureDecisionId(candidatureDecisionId)
                .etudiantOffreDecisionId(etudiantOffreDecisionId)
                .candidaturePostulationId(candidaturePostulationId)
                .signatureEntenteCandidatureId(signatureEntenteCandidatureId)
                .build();
    }
}