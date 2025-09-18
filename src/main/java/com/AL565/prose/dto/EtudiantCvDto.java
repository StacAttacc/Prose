package com.AL565.prose.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class EtudiantCvDto {
    // Getters and setters
    private String name;
    private String type;
    private long size;
    private String lastModified;
    private Instant lastModifiedDate;
    private byte[] data;

    public void setName(String name) { this.name = name; }

    public void setType(String type) { this.type = type; }

    public void setSize(long size) { this.size = size; }

    public void setLastModified(String lastModified) { this.lastModified = lastModified; }

    public void setLastModifiedDate(Instant lastModifiedDate) { this.lastModifiedDate = lastModifiedDate; }

    public void setData(byte[] data) { this.data = data; }
}