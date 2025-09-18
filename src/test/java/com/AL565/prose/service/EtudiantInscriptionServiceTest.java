package com.AL565.prose.service;

import com.AL565.prose.model.Discipline;
import com.AL565.prose.repository.ProseUserRepository;
import com.AL565.prose.service.dto.EtudiantDto;
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
        EtudiantDto dto = new EtudiantDto();
        dto.setFirstName("Jean");
        dto.setLastName("Dupont");
        dto.setEmail("jean.dupont@test.com");
        dto.setPassword("motdepasse123");
        dto.setDiscipline(Discipline.INFORMATIQUE);

        etudiantInscriptionService.inscrireEtudiant(dto);

        assertTrue(proseUserRepository.findByCredentials_Username("jean.dupont@test.com").isPresent());
    }

    @Test
    void testInscrireEtudiant_EmailDejaExistant() {
        EtudiantDto dto1 = new EtudiantDto();
        dto1.setFirstName("Jean");
        dto1.setLastName("Dupont");
        dto1.setEmail("test@example.com");
        dto1.setPassword("motdepasse123");
        dto1.setDiscipline(Discipline.INFORMATIQUE);

        etudiantInscriptionService.inscrireEtudiant(dto1);

        EtudiantDto dto2 = new EtudiantDto();
        dto2.setFirstName("Marie");
        dto2.setLastName("Martin");
        dto2.setEmail("test@example.com");
        dto2.setPassword("autremotdepasse");
        dto2.setDiscipline(Discipline.MARKETING);

        assertThrows(EmailAlreadyExistsException.class, () ->
            etudiantInscriptionService.inscrireEtudiant(dto2)
        );
    }
}