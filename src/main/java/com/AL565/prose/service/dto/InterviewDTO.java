package com.AL565.prose.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewDTO {
    private Long applicantId;     
    private String dateTime;  // Reçu comme String ISO

    // Méthode helper pour convertir en LocalDateTime
    public LocalDateTime getDateTimeAsLocalDateTime() {
        if (dateTime == null || dateTime.isEmpty()) {
            return null;
        }
        try {
            // Parse ISO string avec timezone (format: 2025-10-28T14:30:00.000Z)
            Instant instant = Instant.parse(dateTime);
            // Convertir en LocalDateTime avec le fuseau horaire du système
            return LocalDateTime.ofInstant(instant, ZoneId.systemDefault());
        } catch (Exception e) {
            // Fallback: essayer de parser directement comme LocalDateTime
            return LocalDateTime.parse(dateTime);
        }
    }
}
