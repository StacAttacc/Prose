
package com.AL565.prose.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "stage")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Stage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private Integer durationWeeks;

    @Lob
    private String description;

    private String requirements;

    @ElementCollection
    @CollectionTable(name = "stage_skill", joinColumns = @JoinColumn(name = "stage_id"))
    private List<String> skills = new ArrayList<>();


    private LocalDate startDate;

    private LocalDate endDate;


    private String location;

    private String workMode;

    @Size(max = 255)
    private String compensation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OfferStatus status = OfferStatus.SOUMISE;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "employeur_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_stage_employeur"))
    private Employeur employeur;


    @Column(nullable = false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(nullable = false)
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }
}
