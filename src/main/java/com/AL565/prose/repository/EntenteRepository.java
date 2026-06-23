package com.AL565.prose.repository;

import com.AL565.prose.model.entente.Entente;
import com.AL565.prose.model.entente.EntenteStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EntenteRepository extends JpaRepository<Entente, Long> {
    Optional<Entente> findByCandidatureId(Long candidatureId);
    List<Entente> findAllByStatusAndCandidature_Stage_EmployeurEmail(EntenteStatus status, String employeurEmail);
}
