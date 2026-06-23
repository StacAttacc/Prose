package com.AL565.prose.repository;

import com.AL565.prose.model.OfferStatus;
import com.AL565.prose.model.Stage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface StageRepository extends JpaRepository<Stage, Long> {

    List<Stage> findByEmployeurEmail(String employeurEmail);
    List<Stage> findByStatus(OfferStatus status);
    List<Stage> findAllByStartDateBetween(LocalDate from, LocalDate to);
    List<Stage> findByEmployeurEmailAndStartDateBetween(String employeurEmail, LocalDate from, LocalDate to);
    List<Stage> findByStatusAndStartDateBetween(OfferStatus status, LocalDate from, LocalDate to);
}
