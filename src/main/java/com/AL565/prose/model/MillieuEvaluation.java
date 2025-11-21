package com.AL565.prose.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MillieuEvaluation {
    @Id
    @Column(name = "millieu_evaluation_id")
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
}
