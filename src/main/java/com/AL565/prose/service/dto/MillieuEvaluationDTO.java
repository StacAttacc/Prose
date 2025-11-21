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

    public boolean getDesireAutreStagiaires() {
        return desireAutreStagiaires;
    }

    public boolean getQuartsVariables() {
        return quartsVariables;
    }

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
                .volumeTravailAcceptable(dto.getVolumeTravailAcceptable())
                .build();
    }
}
