package com.AL565.prose.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "evaluation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@EqualsAndHashCode(of = "id")
public class Evaluation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "entente_id", nullable = false)
    private com.AL565.prose.model.entente.Entente entente;

    @ManyToOne
    @JoinColumn(name = "employeur_id", nullable = false)
    private Employeur employeur;

    @ManyToOne
    @JoinColumn(name = "etudiant_id", nullable = false)
    private Etudiant etudiant;

    @Column(name = "nom_eleve")
    private String nomEleve;

    @Column(name = "programme_etudes")
    private String programmeEtudes;

    @Column(name = "nom_entreprise")
    private String nomEntreprise;

    @Column(name = "nom_superviseur")
    private String nomSuperviseur;

    @Column(name = "fonction_superviseur")
    private String fonction;

    @Column(name = "telephone_superviseur")
    private String telephone;

    @Column(name = "prod_planification", length = 32)
    private String productivitePlanificationOrganisation;

    @Column(name = "prod_directives", length = 32)
    private String productiviteComprendDirectives;

    @Column(name = "prod_rythme", length = 32)
    private String productiviteMaintientRythme;

    @Column(name = "prod_priorites", length = 32)
    private String productiviteEtablitPriorites;

    @Column(name = "prod_echeanciers", length = 32)
    private String productiviteRespectEcheanciers;

    @Column(name = "prod_commentaires", columnDefinition = "TEXT")
    private String productiviteCommentaires;

    @Column(name = "qualite_mandats", length = 32)
    private String qualiteRespectMandats;

    @Column(name = "qualite_details", length = 32)
    private String qualiteAttentionDetails;

    @Column(name = "qualite_verifie", length = 32)
    private String qualiteVerifieTravail;

    @Column(name = "qualite_perfectionnement", length = 32)
    private String qualitePerfectionnement;

    @Column(name = "qualite_analyse", length = 32)
    private String qualiteAnalyseProblemes;

    @Column(name = "qualite_commentaires", columnDefinition = "TEXT")
    private String qualiteCommentaires;

    @Column(name = "relations_contact", length = 32)
    private String relationsContactFacile;

    @Column(name = "relations_equipe", length = 32)
    private String relationsTravailEquipe;

    @Column(name = "relations_culture", length = 32)
    private String relationsAdaptationCulture;

    @Column(name = "relations_critiques", length = 32)
    private String relationsAccepteCritiques;

    @Column(name = "relations_respect", length = 32)
    private String relationsRespectueux;

    @Column(name = "relations_ecoute", length = 32)
    private String relationsEcouteActive;

    @Column(name = "relations_commentaires", columnDefinition = "TEXT")
    private String relationsCommentaires;

    @Column(name = "habiletes_interet", length = 32)
    private String habiletesInteretMotivation;

    @Column(name = "habiletes_expression", length = 32)
    private String habiletesExprimeIdees;

    @Column(name = "habiletes_initiative", length = 32)
    private String habiletesInitiative;

    @Column(name = "habiletes_securitaire", length = 32)
    private String habiletesTravailSecuritaire;

    @Column(name = "habiletes_responsabilites", length = 32)
    private String habiletesSensResponsabilites;

    @Column(name = "habiletes_ponctualite", length = 32)
    private String habiletesPonctualiteAssiduite;

    @Column(name = "habiletes_commentaires", columnDefinition = "TEXT")
    private String habiletesCommentaires;

    @Column(name = "appreciation_globale", length = 32)
    private String appreciationGlobale;

    @Column(name = "appreciation_precisions", columnDefinition = "TEXT")
    private String appreciationPrecisions;

    @Column(name = "evaluation_discutee")
    private Boolean evaluationDiscutee;

    @Column(name = "heures_encadrement")
    private String heuresEncadrement;

    @Column(name = "accueillir_prochain_stage", length = 16)
    private String accueillirProchainStage;

    @Column(name = "formation_suffisante", columnDefinition = "TEXT")
    private String formationSuffisante;

    // Signature
    @Column(name = "signataire_nom")
    private String signataireNom;

    @Column(name = "signataire_fonction")
    private String signataireFonction;

    @Column(name = "signataire_date")
    private LocalDate signataireDate;

    @Column(name = "signature_employeur")
    private String signatureEmployeur;

    @Column(name = "date_signature")
    private LocalDateTime dateSignature;

    @Column(name = "date_evaluation", nullable = false)
    private LocalDateTime dateEvaluation;

    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation;

    @Column(name = "date_modification")
    private LocalDateTime dateModification;
}