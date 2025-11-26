package com.AL565.prose.service.dto;

import com.AL565.prose.model.CoteEvaluation;
import com.AL565.prose.model.MillieuEvaluation;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MillieuEvaluationDTO {
    private Long id;

    private String nomEntreprise;
    private String personneContact;
    private String addresse;
    private String numeroTelephone;
    private String ville;
    private String telecopieur;
    private String codePostal;

    private String nomStagiaire;
    private String dateStage;
    private int numeroStage;

    private CoteEvaluation tachesCoformes;
    private CoteEvaluation faciliteIntegration;
    private CoteEvaluation tempsEstReel;

    private List<String> hrSemaineMois;

    private CoteEvaluation hygieneRespectable;
    private CoteEvaluation climatTravailAgreable;
    private CoteEvaluation accessibleTransportCommun;
    private CoteEvaluation salaireIneteressant;
    private String salaire;
    private CoteEvaluation communicationSuperviseurFacile;
    private CoteEvaluation equipementAdequat;
    private CoteEvaluation volumeTravailAcceptable;
    private String commentaires;

    private int privilegieStage;
    private int nbStagiaires;
    private Boolean desireAutreStagiaires;
    private Boolean quartsVariables;
    private List<LocalDateTime> debutQuarts;
    private List<LocalDateTime> finQuarts;

    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private LocalDateTime tempsSignature;

    private long candidatureId;

    public static MillieuEvaluation toModel(MillieuEvaluationDTO dto) {
        MillieuEvaluation.MillieuEvaluationBuilder builder = MillieuEvaluation.builder()
                .accessibleTransportCommun(dto.getAccessibleTransportCommun())
                .addresse(dto.getAddresse())
                .climatTravailAgreable(dto.getClimatTravailAgreable())
                .codePostal(dto.getCodePostal())
                .commentaires(dto.getCommentaires())
                .communicationSuperviseurFacile(dto.getCommunicationSuperviseurFacile())
                .dateStage(dto.getDateStage())
                .debutQuarts(dto.getDebutQuarts())
                .desireAutreStagiaires(dto.getDesireAutreStagiaires())
                .equipementAdequat(dto.getEquipementAdequat())
                .faciliteIntegration(dto.getFaciliteIntegration())
                .finQuarts(dto.getFinQuarts())
                .hrSemaineMois(dto.getHrSemaineMois())
                .hygieneRespectable(dto.getHygieneRespectable())
                .nbStagiaires(dto.getNbStagiaires())
                .nomEntreprise(dto.getNomEntreprise())
                .nomStagiaire(dto.getNomStagiaire())
                .numeroStage(dto.getNumeroStage())
                .numeroTelephone(dto.getNumeroTelephone())
                .personneContact(dto.getPersonneContact())
                .privilegieStage(dto.getPrivilegieStage())
                .quartsVariables(dto.getQuartsVariables())
                .salaire(dto.getSalaire())
                .salaireIneteressant(dto.getSalaireIneteressant())
                .tachesCoformes(dto.getTachesCoformes())
                .telecopieur(dto.getTelecopieur())
                .tempsEstReel(dto.getTempsEstReel())
                .tempsSignature(dto.getTempsSignature())
                .ville(dto.getVille())
                .volumeTravailAcceptable(dto.getVolumeTravailAcceptable());

        if (dto.getId() != null) {
            builder.id(dto.getId());
        }

        return builder.build();
    }

    public static MillieuEvaluationDTO toDTO(MillieuEvaluation model) {
        return MillieuEvaluationDTO.builder()
                .id(model.getId())
                .accessibleTransportCommun(model.getAccessibleTransportCommun())
                .addresse(model.getAddresse())
                .climatTravailAgreable(model.getClimatTravailAgreable())
                .codePostal(model.getCodePostal())
                .commentaires(model.getCommentaires())
                .communicationSuperviseurFacile(model.getCommunicationSuperviseurFacile())
                .dateStage(model.getDateStage())
                .debutQuarts(model.getDebutQuarts())
                .desireAutreStagiaires(model.getDesireAutreStagiaires())
                .equipementAdequat(model.getEquipementAdequat())
                .faciliteIntegration(model.getFaciliteIntegration())
                .finQuarts(model.getFinQuarts())
                .hrSemaineMois(model.getHrSemaineMois())
                .hygieneRespectable(model.getHygieneRespectable())
                .nbStagiaires(model.getNbStagiaires())
                .nomEntreprise(model.getNomEntreprise())
                .nomStagiaire(model.getNomStagiaire())
                .numeroStage(model.getNumeroStage())
                .numeroTelephone(model.getNumeroTelephone())
                .personneContact(model.getPersonneContact())
                .privilegieStage(model.getPrivilegieStage())
                .quartsVariables(model.getQuartsVariables())
                .salaire(model.getSalaire())
                .salaireIneteressant(model.getSalaireIneteressant())
                .tachesCoformes(model.getTachesCoformes())
                .telecopieur(model.getTelecopieur())
                .tempsEstReel(model.getTempsEstReel())
                .tempsSignature(model.getTempsSignature())
                .ville(model.getVille())
                .volumeTravailAcceptable(model.getVolumeTravailAcceptable())
                .build();
    }
}
