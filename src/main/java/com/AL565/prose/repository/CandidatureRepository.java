package com.AL565.prose.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.AL565.prose.model.Candidature;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface CandidatureRepository extends JpaRepository<Candidature, Long> {
    boolean existsByEtudiant_Credentials_UsernameAndStage_Id(String username, Long stageId);
    Optional<List<Candidature>> findAllByStage_Id(long id);

    List<Candidature> findByEtudiant_Credentials_Username(String username);

    List<Candidature> findAllByEvaluationMillieuIsNull();
}
