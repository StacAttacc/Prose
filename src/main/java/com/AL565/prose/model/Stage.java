
package com.AL565.prose.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "internship_offers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Stage {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank @Size(max = 160)
    private String title;

    @NotBlank @Lob
    private String description;

    /** Exigences / compétences requises en texte libre */
    @NotBlank @Column(length = 4000)
    private String requirements;

    /** CSV optionnel, ex: "Java,Spring,SQL" */
    @Column(length = 1000)
    private String skillsCsv;

    private LocalDate startDate;

    @Min(1) @Max(52)
    private Integer durationWeeks;

    @Size(max = 255)
    private String location;

    @Size(max = 50)
    private String workMode;

    @Size(max = 255)
    private String compensation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OfferStatus status = OfferStatus.SOUMISE;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "employeur_id")
    private Employeur employeur;

    @Column(nullable = false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(nullable = false)
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    @PreUpdate
    public void onUpdate(){ this.updatedAt = OffsetDateTime.now(); }
}
