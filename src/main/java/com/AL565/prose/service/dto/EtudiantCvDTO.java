package com.AL565.prose.service.dto;

import com.AL565.prose.model.CV;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.Date;

@Getter
@Setter
@Data
public class EtudiantCvDTO {
    private String name;
    private String type;
    private long size;
    private String lastModified;
    private Instant lastModifiedDate;
    private Date approvedAt;
    private Date rejectedAt;
    private byte[] data;

    public static EtudiantCvDTO toDto(CV cv) {
        EtudiantCvDTO dto = new EtudiantCvDTO();
        dto.setName(cv.getName());
        dto.setType(cv.getType());
        dto.setSize(cv.getSize());
        dto.setLastModified(cv.getLastModified());
        dto.setLastModifiedDate(cv.getLastModifiedDate());
        dto.setApprovedAt(cv.getApprovedAt());
        dto.setRejectedAt(cv.getRejectedAt());
        dto.setData(cv.getData());
        return dto;
    }
}