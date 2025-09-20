package com.AL565.prose.repository;

import com.AL565.prose.model.CV;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProseCvRepository extends JpaRepository<CV, Long> {
    Optional<CV> findByEtudiant_Id(Long etudiantId);
}
