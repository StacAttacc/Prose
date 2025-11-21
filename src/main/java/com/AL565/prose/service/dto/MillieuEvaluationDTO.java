package com.AL565.prose.service.dto;

import com.AL565.prose.model.CoteEvaluation;
import com.AL565.prose.model.MillieuEvaluation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    private boolean desireAutreStagiaires;
    private boolean quartsVariables;
    private List<LocalDateTime> debutQuarts;
    private List<LocalDateTime> finQuarts;

    private LocalDateTime tempsSignature;

    public static MillieuEvaluation toModel(MillieuEvaluationDTO dto) {
        return MillieuEvaluation.builder()
                .id(dto.getId())
                .accessibleTransportCommun(dto.getAccessibleTransportCommun())
                .addresse(dto.getAddresse())
                .climatTravailAgreable(dto.getClimatTravailAgreable())
                .codePostal(dto.getCodePostal())
                .commentaires(dto.getCommentaires())
                .communicationSuperviseurFacile(dto.getCommunicationSuperviseurFacile())
                .dateStage(dto.getDateStage())
                .debutQuarts(dto.getDebutQuarts())
                .desireAutreStagiaires(dto.isDesireAutreStagiaires())
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
                .quartsVariables(dto.isQuartsVariables())
                .salaire(dto.getSalaire())
                .salaireIneteressant(dto.getSalaireIneteressant())
                .tachesCoformes(dto.getTachesCoformes())
                .telecopieur(dto.getTelecopieur())
                .tempsEstReel(dto.getTempsEstReel())
                .tempsSignature(dto.getTempsSignature())
                .ville(dto.getVille())
                .volumeTravailAcceptable(dto.getVolumeTravailAcceptable())
                .build();
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
                .desireAutreStagiaires(model.isDesireAutreStagiaires())
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
                .quartsVariables(model.isQuartsVariables())
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
