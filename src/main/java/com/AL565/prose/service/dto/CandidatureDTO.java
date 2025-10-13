package com.AL565.prose.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidatureDTO {
    private Long stageId;
    private String etudiantEmail;
    private byte[] motivationLetterData;
    private String motivationLetterFileName;
    private String motivationLetterContentType;
    private long motivationLetterSize;
}

