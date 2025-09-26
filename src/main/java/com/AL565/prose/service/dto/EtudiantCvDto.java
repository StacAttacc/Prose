package com.AL565.prose.service.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Data
public class EtudiantCvDto {
    private String name;
    private String type;
    private long size;
    private String lastModified;
    private Instant lastModifiedDate;
    private byte[] data;
}