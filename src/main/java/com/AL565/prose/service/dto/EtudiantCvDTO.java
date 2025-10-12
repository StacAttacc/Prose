package com.AL565.prose.service.dto;

import com.AL565.prose.model.CV;
import com.AL565.prose.model.CvStatus;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.Base64;

@Getter
@Setter
@Data
public class EtudiantCvDTO {
    private String name;
    private String type;
    private long size;
    private String lastModified;
    private Instant lastModifiedDate;
    private String status;
    private String data;
    private  String comment;

    public static EtudiantCvDTO toDto(CV cv) {
        EtudiantCvDTO dto = new EtudiantCvDTO();
        dto.setName(cv.getName());
        dto.setType(cv.getType());
        dto.setSize(cv.getSize());
        dto.setLastModified(cv.getLastModified());
        dto.setLastModifiedDate(cv.getLastModifiedDate());
        dto.setStatus(cv.getStatus().name());
        dto.setData(Base64.getEncoder().encodeToString(cv.getData()));
        dto.setComment(cv.getComment());
        return dto;
    }

    public static CV fromDTO(EtudiantCvDTO dto) {
        return CV.builder()
                .name(dto.getName())
                .type(dto.getType())
                .size(dto.getSize())
                .lastModified(dto.getLastModified())
                .lastModifiedDate(dto.getLastModifiedDate())
                .data(Base64.getDecoder().decode(dto.getData()))
                .status(CvStatus.valueOf(dto.getStatus()))
                .comment(dto.getComment())
                .build();
    }
}