package com.AL565.prose.model;

import jakarta.persistence.*;
import lombok.*;

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

    @Column(name = "productivite", nullable = false)
    private Integer productivite;

    @Column(name = "qualite_travail", nullable = false)
    private Integer qualiteTravail;

    @Column(name = "relations_interpersonnelles", nullable = false)
    private Integer relationsInterpersonnelles;

    @Column(name = "habiletes_personnelles", nullable = false)
    private Integer habiletesPersonnelles;

    @Column(name = "appreciation_globale", nullable = false)
    private Integer appreciationGlobale;

    @Column(name = "commentaires", columnDefinition = "TEXT")
    private String commentaires;

    @Column(name = "points_forts", columnDefinition = "TEXT")
    private String pointsForts;

    @Column(name = "points_amelioration", columnDefinition = "TEXT")
    private String pointsAmelioration;

    @Column(name = "heure_encadrement")
    private String heureEncadrement;

    @Column(name = "garde_contact")
    private Boolean gardeContact;

    @Column(name = "rehire_etudiant")
    private Boolean rehireEtudiant;

    @Column(name = "date_evaluation", nullable = false)
    private LocalDateTime dateEvaluation;

    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation;

    @Column(name = "date_modification")
    private LocalDateTime dateModification;
}