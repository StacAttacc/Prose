package com.AL565.prose.repository;

import com.AL565.prose.model.CV;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CvRepository extends JpaRepository<CV, Long> {
    Optional<CV> findByEtudiant_Credentials_Username(String username);
    List<CV> findCVSByApprovedAtIsNull();
}
