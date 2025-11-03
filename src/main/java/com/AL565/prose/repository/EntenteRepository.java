package com.AL565.prose.repository;

import com.AL565.prose.model.entente.Entente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EntenteRepository extends JpaRepository<Entente, Long> {
    Optional<Entente> findByCandidatureId(Long candidatureId);
    boolean existsByCandidatureId(Long candidatureId);
}
