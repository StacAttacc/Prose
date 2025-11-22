package com.AL565.prose.service.dto;

import com.AL565.prose.model.Evaluation;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class EvaluationDTO {
    private Long id;
    private Long ententeId;
    private Long employeurId;
    private Long etudiantId;

    private String etudiantNom;
    private String etudiantPrenom;
    private String employeurNom;
    private String stageTitle;

    private String nomEleve;
    private String programmeEtudes;
    private String nomEntreprise;
    private String nomSuperviseur;
    private String fonction;
    private String telephone;

    private String productivitePlanificationOrganisation;
    private String productiviteComprendDirectives;
    private String productiviteMaintientRythme;
    private String productiviteEtablitPriorites;
    private String productiviteRespectEcheanciers;
    private String productiviteCommentaires;

    private String qualiteRespectMandats;
    private String qualiteAttentionDetails;
    private String qualiteVerifieTravail;
    private String qualitePerfectionnement;
    private String qualiteAnalyseProblemes;
    private String qualiteCommentaires;

    private String relationsContactFacile;
    private String relationsTravailEquipe;
    private String relationsAdaptationCulture;
    private String relationsAccepteCritiques;
    private String relationsRespectueux;
    private String relationsEcouteActive;
    private String relationsCommentaires;

    private String habiletesInteretMotivation;
    private String habiletesExprimeIdees;
    private String habiletesInitiative;
    private String habiletesTravailSecuritaire;
    private String habiletesSensResponsabilites;
    private String habiletesPonctualiteAssiduite;
    private String habiletesCommentaires;

    private String appreciationGlobale;
    private String appreciationPrecisions;

    private Boolean evaluationDiscutee;
    private String heuresEncadrement;
    private String accueillirProchainStage;
    private String formationSuffisante;

    private String signataireNom;
    private String signataireFonction;
    private LocalDate signataireDate;
    private String signatureEmployeur;
    private LocalDateTime dateSignature;

    private String password;

    private LocalDateTime dateEvaluation;
    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;

    public static EvaluationDTO toDTO(Evaluation evaluation) {
        return EvaluationDTO.builder()
                .id(evaluation.getId())
                .ententeId(evaluation.getEntente().getId())
                .employeurId(evaluation.getEmployeur().getId())
                .etudiantId(evaluation.getEtudiant().getId())
                .etudiantNom(evaluation.getEtudiant().getLastName())
                .etudiantPrenom(evaluation.getEtudiant().getFirstName())
                .employeurNom(evaluation.getEmployeur().getCompany())
                .stageTitle(evaluation.getEntente().getCandidature().getStage().getTitle())
                .nomEleve(evaluation.getNomEleve())
                .programmeEtudes(evaluation.getProgrammeEtudes())
                .nomEntreprise(evaluation.getNomEntreprise())
                .nomSuperviseur(evaluation.getNomSuperviseur())
                .fonction(evaluation.getFonction())
                .telephone(evaluation.getTelephone())
                .productivitePlanificationOrganisation(evaluation.getProductivitePlanificationOrganisation())
                .productiviteComprendDirectives(evaluation.getProductiviteComprendDirectives())
                .productiviteMaintientRythme(evaluation.getProductiviteMaintientRythme())
                .productiviteEtablitPriorites(evaluation.getProductiviteEtablitPriorites())
                .productiviteRespectEcheanciers(evaluation.getProductiviteRespectEcheanciers())
                .productiviteCommentaires(evaluation.getProductiviteCommentaires())
                .qualiteRespectMandats(evaluation.getQualiteRespectMandats())
                .qualiteAttentionDetails(evaluation.getQualiteAttentionDetails())
                .qualiteVerifieTravail(evaluation.getQualiteVerifieTravail())
                .qualitePerfectionnement(evaluation.getQualitePerfectionnement())
                .qualiteAnalyseProblemes(evaluation.getQualiteAnalyseProblemes())
                .qualiteCommentaires(evaluation.getQualiteCommentaires())
                .relationsContactFacile(evaluation.getRelationsContactFacile())
                .relationsTravailEquipe(evaluation.getRelationsTravailEquipe())
                .relationsAdaptationCulture(evaluation.getRelationsAdaptationCulture())
                .relationsAccepteCritiques(evaluation.getRelationsAccepteCritiques())
                .relationsRespectueux(evaluation.getRelationsRespectueux())
                .relationsEcouteActive(evaluation.getRelationsEcouteActive())
                .relationsCommentaires(evaluation.getRelationsCommentaires())
                .habiletesInteretMotivation(evaluation.getHabiletesInteretMotivation())
                .habiletesExprimeIdees(evaluation.getHabiletesExprimeIdees())
                .habiletesInitiative(evaluation.getHabiletesInitiative())
                .habiletesTravailSecuritaire(evaluation.getHabiletesTravailSecuritaire())
                .habiletesSensResponsabilites(evaluation.getHabiletesSensResponsabilites())
                .habiletesPonctualiteAssiduite(evaluation.getHabiletesPonctualiteAssiduite())
                .habiletesCommentaires(evaluation.getHabiletesCommentaires())
                .appreciationGlobale(evaluation.getAppreciationGlobale())
                .appreciationPrecisions(evaluation.getAppreciationPrecisions())
                .evaluationDiscutee(evaluation.getEvaluationDiscutee())
                .heuresEncadrement(evaluation.getHeuresEncadrement())
                .accueillirProchainStage(evaluation.getAccueillirProchainStage())
                .formationSuffisante(evaluation.getFormationSuffisante())
                .signataireNom(evaluation.getSignataireNom())
                .signataireFonction(evaluation.getSignataireFonction())
                .signataireDate(evaluation.getSignataireDate())
                .signatureEmployeur(evaluation.getSignatureEmployeur())
                .dateSignature(evaluation.getDateSignature())
                .dateEvaluation(evaluation.getDateEvaluation())
                .dateCreation(evaluation.getDateCreation())
                .dateModification(evaluation.getDateModification())
                .build();
    }
}