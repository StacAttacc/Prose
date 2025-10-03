package com.AL565.prose.repository;

import com.AL565.prose.model.OfferStatus;
import com.AL565.prose.model.Stage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StageRepository extends JpaRepository<Stage, Long> {
    List<Stage> findByEmployeur_Id(Long employeurId);
    List<Stage> findByEmployeur_IdAndStatus(Long employeurId, OfferStatus status);
}
