package com.AL565.prose.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.Instant;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@EqualsAndHashCode(of = "id")
public class CV {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String type;
    private long size;
    private String lastModified;
    private Instant lastModifiedDate;

    @Basic(fetch = FetchType.LAZY)
    @Column(columnDefinition="bytea")
    private byte[] data;

    @OneToOne
    @JoinColumn(name = "etudiant_id")
    private Etudiant etudiant;
}