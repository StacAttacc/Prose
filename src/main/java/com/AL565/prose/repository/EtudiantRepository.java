package com.AL565.prose.repository;

import com.AL565.prose.model.auth.Etudiant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EtudiantRepository extends JpaRepository<Etudiant, Long> {
}