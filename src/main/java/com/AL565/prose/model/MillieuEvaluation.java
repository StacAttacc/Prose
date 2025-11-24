package com.AL565.prose.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;

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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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

    @ElementCollection
    @CollectionTable(name = "millieu_evaluation_hr_semaine_mois", joinColumns = @JoinColumn(name = "millieu_evaluation_id"))
    @Column(name = "hr_semaine_mois")
    @Builder.Default
    private List<String> hrSemaineMois = new ArrayList<>();

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
    
    @ElementCollection
    @CollectionTable(name = "millieu_evaluation_debut_quarts", joinColumns = @JoinColumn(name = "millieu_evaluation_id"))
    @Column(name = "debut_quart")
    @Builder.Default
    private List<LocalDateTime> debutQuarts = new ArrayList<>();
    
    @ElementCollection
    @CollectionTable(name = "millieu_evaluation_fin_quarts", joinColumns = @JoinColumn(name = "millieu_evaluation_id"))
    @Column(name = "fin_quart")
    @Builder.Default
    private List<LocalDateTime> finQuarts = new ArrayList<>();

    private LocalDateTime tempsSignature;
}
