package com.AL565.prose.repository;

import com.AL565.prose.model.Etudiant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EtudiantRepository extends JpaRepository<Etudiant, Long> {
    Optional<Etudiant> findEtudiantByCredentials_Username(String email);
    List<Etudiant> findAllByProfesseurResponsable_Id(Long professeurId);
}
