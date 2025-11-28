package com.AL565.prose.repository;

import com.AL565.prose.model.Evaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {

    Optional<Evaluation> findByEntenteId(Long ententeId);

    boolean existsByEntenteId(Long ententeId);
}