package com.AL565.prose.dto;

import com.AL565.prose.model.Etudiant;

import java.time.Instant;

public class EtudiantCvDto {
    private String name;
    private String type;
    private long size;
    private String lastModified;
    private Instant lastModifiedDate;
    private byte[] data;
    private String studentEmail;
}
