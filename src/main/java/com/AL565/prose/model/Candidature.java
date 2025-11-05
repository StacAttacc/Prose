package com.AL565.prose.model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Basic;
import jakarta.persistence.Column;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.ToString;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "candidature")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@EqualsAndHashCode(of = "id")
public class Candidature {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "etudiant_id", nullable = false)
    private Etudiant etudiant;

    @ManyToOne
    @JoinColumn(name = "cv_id", nullable = false)
    private CV cv;

    @Basic(fetch = FetchType.LAZY)
    @Column(columnDefinition="bytea")
    private byte[] motivationLetter;

    @ManyToOne
    @JoinColumn(name = "stage_id", nullable = false)
    private Stage stage;

    @Column(name = "date_candidature", nullable = false)
    private LocalDateTime dateCandidature;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private CandidatureStatus status;

    @Column(name = "date_decision")
    private LocalDateTime dateDecision;

    @Column(name = "decision", length = 500)
    private String decision;

    public Long getStageId() {
        return stage.getId();
    }
}
