package com.AL565.prose.model.entente;

import com.AL565.prose.model.Candidature;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "entente")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class Entente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "candidature_id", nullable = false, unique = true)
    private Candidature candidature;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EntenteStatus status = EntenteStatus.A_SIGNER;

    @Basic(fetch = FetchType.LAZY)
    @Column(columnDefinition="bytea")
    private byte[] documentPdf;

    private String documentName;
    private String documentType = "application/pdf";
    private Long documentSize;

    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation = LocalDateTime.now();

    @Column(name = "date_signature_etudiant")
    private LocalDateTime dateSignatureEtudiant;

    @Column(name = "date_signature_employeur")
    private LocalDateTime dateSignatureEmployeur;

    @Column(name = "date_signature_gestionnaire")
    private LocalDateTime dateSignatureGestionnaire;

    @Column(name = "date_signature_complete")
    private LocalDateTime dateSignatureComplete;
}
