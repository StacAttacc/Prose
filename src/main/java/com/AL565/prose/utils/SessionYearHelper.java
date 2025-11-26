package com.AL565.prose.utils;

import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class SessionYearHelper {
    public static int getSessionYear(String year) {
        if (year != null) {
            return Integer.parseInt(year);
        }
        else if (LocalDate.now().getMonth().getValue() > 8) {
            return LocalDate.now().getYear() + 1;
        }
        else {
            return LocalDate.now().getYear();
        }
    }
}
