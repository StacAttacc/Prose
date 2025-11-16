package com.AL565.prose.repository;

import com.AL565.prose.model.Evaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {

    List<Evaluation> findByEmployeurId(Long employeurId);

    List<Evaluation> findByEtudiantId(Long etudiantId);

    Optional<Evaluation> findByEntenteId(Long ententeId);

    boolean existsByEntenteId(Long ententeId);
}