package com.AL565.prose.repository;

import com.AL565.prose.model.Professeur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProfesseurRepository extends JpaRepository<Professeur, Long> {
    Optional<Professeur> findByCredentials_Username(String username);
}
