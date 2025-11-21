package com.AL565.prose.repository;

import com.AL565.prose.model.OfferStatus;
import com.AL565.prose.model.Stage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StageRepository extends JpaRepository<Stage, Long> {

    List<Stage> findByEmployeurEmail(String employeurEmail);
    List<Stage> findByStatus(OfferStatus status);

    List<Stage> findAllByEvaluationMillieuIsNull();
}
