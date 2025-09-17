package com.AL565.prose.service;

import com.AL565.prose.model.Discipline;
import com.AL565.prose.repository.ProseUserRepository;
import com.AL565.prose.service.exception.EmailAlreadyExistsException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class EtudiantInscriptionServiceTest {

    @Autowired
    private EtudiantInscriptionService etudiantInscriptionService;

    @Autowired
    private ProseUserRepository proseUserRepository;

    @Test
    void testInscrireEtudiant_Success() {
        // Exécuter
        etudiantInscriptionService.inscrireEtudiant(
                "Jean",
                "Dupont",
                "jean.dupont@test.com",
                "motdepasse123",
                Discipline.INFORMATIQUE
        );

        // Vérifier en base de données
        assertTrue(proseUserRepository.findByCredentials_Username("jean.dupont@test.com").isPresent());
    }

    @Test
    void testInscrireEtudiant_EmailDejaExistant() {
        // Préparer - créer un premier étudiant
        etudiantInscriptionService.inscrireEtudiant(
                "Jean",
                "Dupont",
                "test@example.com",
                "motdepasse123",
                Discipline.INFORMATIQUE
        );

        // Vérifier que l'exception est lancée pour le même email
        assertThrows(EmailAlreadyExistsException.class, () ->
                etudiantInscriptionService.inscrireEtudiant(
                        "Marie",
                        "Martin",
                        "test@example.com",
                        "autremotdepasse",
                        Discipline.MARKETING
                )
        );
    }
}
