package com.AL565.prose.service;

import com.AL565.prose.model.auth.Discipline;
import com.AL565.prose.model.auth.Etudiant;
import com.AL565.prose.repository.EtudiantRepository;
import com.AL565.prose.repository.ProseUserRepository;
import com.AL565.prose.security.exception.EmailAlreadyExistsException;
import com.AL565.prose.service.dto.EtudiantInscriptionDto;
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
        // Préparer les données
        EtudiantInscriptionDto dto = new EtudiantInscriptionDto();
        dto.setFirstName("Jean");
        dto.setLastName("Dupont");
        dto.setEmail("jean.dupont@test.com");
        dto.setPassword("motdepasse123");
        dto.setDiscipline(Discipline.INFORMATIQUE);

        // Exécuter
        EtudiantInscriptionDto result = etudiantInscriptionService.inscrireEtudiant(dto);

        // Vérifier
        assertNotNull(result);
        assertEquals("Jean", result.getFirstName());
        assertEquals("Dupont", result.getLastName());
        assertEquals("jean.dupont@test.com", result.getEmail());
        assertEquals(Discipline.INFORMATIQUE, result.getDiscipline());
        assertNull(result.getPassword()); // Le mot de passe ne doit pas être retourné

        // Vérifier en base de données
        assertTrue(proseUserRepository.findByCredentials_Username("jean.dupont@test.com").isPresent());
    }

    @Test
    void testInscrireEtudiant_EmailDejaExistant() {
        // Préparer - créer un premier étudiant
        EtudiantInscriptionDto dto1 = new EtudiantInscriptionDto();
        dto1.setFirstName("Jean");
        dto1.setLastName("Dupont");
        dto1.setEmail("test@example.com");
        dto1.setPassword("motdepasse123");
        dto1.setDiscipline(Discipline.INFORMATIQUE);

        etudiantInscriptionService.inscrireEtudiant(dto1);

        // Essayer d'inscrire un autre étudiant avec le même email
        EtudiantInscriptionDto dto2 = new EtudiantInscriptionDto();
        dto2.setFirstName("Marie");
        dto2.setLastName("Martin");
        dto2.setEmail("test@example.com"); // Même email
        dto2.setPassword("autremotdepasse");
        dto2.setDiscipline(Discipline.MARKETING);

        // Vérifier que l'exception est lancée
        assertThrows(EmailAlreadyExistsException.class, () ->
            etudiantInscriptionService.inscrireEtudiant(dto2)
        );
    }
}