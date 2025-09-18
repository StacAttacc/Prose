package com.AL565.prose.repository;

import com.AL565.prose.model.CV;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProseCvRepository extends JpaRepository<CV, Long> {
    Optional<CV> findByEtudiant_Id(Long etudiantId);
}
