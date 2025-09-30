package com.AL565.prose.service.dto;

import com.AL565.prose.model.Stage;
import com.AL565.prose.model.OfferStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
@AllArgsConstructor
public class StageDTO {
    private Long id;
    private String title;
    private OfferStatus status;
    private OffsetDateTime createdAt;
    private String description;

    public static StageDTO toDTO(Stage offer) {
        return new StageDTO(
                offer.getId(),
                offer.getTitle(),
                offer.getStatus(),
                offer.getCreatedAt(),
                offer.getDescription()
        );
    }
}
