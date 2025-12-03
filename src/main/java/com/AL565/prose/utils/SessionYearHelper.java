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

    public static boolean isInSessionRange(int yearNumber) {
        int year = LocalDate.now().getYear();
        int month = LocalDate.now().getMonth().getValue();

        if (month <= 8) {
            return yearNumber == year || yearNumber == year + 1;
        } else {
            return yearNumber == year + 1;
        }
    }

    public static int getSessionYearFromCvDate(LocalDate cvDate) {
        int year = cvDate.getYear();
        int month = cvDate.getMonthValue();

        if (month >= 9) {
            return year + 1;
        }

        return year;
    }
}
