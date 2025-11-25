package com.AL565.prose.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;
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

    @OneToOne
    @JoinColumn(name = "millieu_evaluation_id")
    private MillieuEvaluation evaluationMillieu;

    public Long getStageId() {
        return stage.getId();
    }

    public String getStageName() {
        return stage.getTitle();
    }
}
