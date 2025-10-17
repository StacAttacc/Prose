package com.AL565.prose.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.AL565.prose.model.Candidature;

import java.util.List;

public interface CandidatureRepository extends JpaRepository<Candidature, Long> {
    boolean existsByEtudiant_Credentials_UsernameAndStage_Id(String username, Long stageId);

    List<Candidature> findByEtudiant_Credentials_Username(String username);
}
