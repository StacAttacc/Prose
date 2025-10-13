package com.AL565.prose.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.AL565.prose.model.Postulation;

public interface PostulationRepository extends JpaRepository<Postulation, Long> {
    boolean existsByEtudiant_Credentials_UsernameAndStage_Id(String username, Long stageId);
}
