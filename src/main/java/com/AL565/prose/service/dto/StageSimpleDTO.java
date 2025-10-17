package com.AL565.prose.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StageSimpleDTO {
    private String title;
    private String description;
    private String requirements;
    private String workMode;
    private String location;
    private String compensation;
    private String startDate;
    private String endDate;
    private List<String> skills;
    private EmployeurDTO employeur;
}
