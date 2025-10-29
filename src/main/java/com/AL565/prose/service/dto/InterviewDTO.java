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
    private String dateTime;  

    public LocalDateTime getDateTimeAsLocalDateTime() {
        if (dateTime == null || dateTime.isEmpty()) {
            return null;
        }
        try {
            Instant instant = Instant.parse(dateTime);
            return LocalDateTime.ofInstant(instant, ZoneId.systemDefault());
        } catch (Exception e) {
            return LocalDateTime.parse(dateTime);
        }
    }
}
