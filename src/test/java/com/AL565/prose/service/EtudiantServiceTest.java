package com.AL565.prose.service;

import com.AL565.prose.model.Discipline;
import com.AL565.prose.model.Etudiant;
import com.AL565.prose.model.OfferStatus;
import com.AL565.prose.model.Postulation;
import com.AL565.prose.repository.EtudiantRepository;
import com.AL565.prose.repository.PostulationRepository;
import com.AL565.prose.repository.ProseUserRepository;
import com.AL565.prose.service.dto.EmployeurDTO;
import com.AL565.prose.service.dto.EtudiantCvDTO;
import com.AL565.prose.service.dto.EtudiantDTO;
import com.AL565.prose.service.dto.EtudiantPasswordDTO;
import com.AL565.prose.service.dto.PostulationDTO;
import com.AL565.prose.service.dto.StageDTO;
import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

    @ExtendWith(MockitoExtension.class)
    class EtudiantServiceTest {

        @Mock
        private ProseUserRepository proseUserRepository;

        @Mock
        private EtudiantRepository etudiantRepository;

        @Mock
        private PostulationRepository postulationRepository;

        @Mock
        private PasswordEncoder passwordEncoder;

        @InjectMocks
        private EtudiantService etudiantService;

        @Test
        void inscrireEtudiant() throws EmailAlreadyExistsException {
            EtudiantPasswordDTO etudiantDTO = new EtudiantPasswordDTO();
            etudiantDTO.setFirstName("Jean");
            etudiantDTO.setLastName("Dupont");
            etudiantDTO.setEmail("jean.dupont@etudiant.ca");
            etudiantDTO.setPassword("motdepasse");
            etudiantDTO.setDiscipline(String.valueOf(Discipline.INFORMATIQUE));

            when(passwordEncoder.encode(anyString())).thenReturn("motdepasseEncode");
            when(proseUserRepository.findByCredentials_Username(anyString())).thenReturn(Optional.empty());

            etudiantService.inscrireEtudiant(etudiantDTO);

            verify(etudiantRepository, times(1)).save(any(Etudiant.class));
        }

        @Test
        void savePostulation_success() {
            PostulationDTO postulationDTO = createValidPostulationDTO();
            etudiantService.savePostulation(postulationDTO);
            verify(postulationRepository, times(1)).save(any(Postulation.class));
        }

        private PostulationDTO createValidPostulationDTO() {
            EtudiantDTO etudiantDTO = new EtudiantDTO();
            etudiantDTO.setId(1L);
            etudiantDTO.setFirstName("Jean");
            etudiantDTO.setLastName("Dupont");
            etudiantDTO.setEmail("jean.dupont@etudiant.ca");
            etudiantDTO.setDiscipline(Discipline.INFORMATIQUE);

            StageDTO stageDTO = new StageDTO();
            stageDTO.setId(1L);
            stageDTO.setTitle("Développeur Full Stack");
            stageDTO.setDescription("Stage en développement web");
            stageDTO.setStatus(OfferStatus.APPROUVEE);
            stageDTO.setLocation("Montréal");
            stageDTO.setCompensation("20$/h");

            EmployeurDTO employeurDTO = new EmployeurDTO();
            employeurDTO.setId(1L);
            employeurDTO.setCompany("TechCorp");
            employeurDTO.setEmail("recrutement@techcorp.com");
            stageDTO.setEmployeur(employeurDTO);

            EtudiantCvDTO cvDTO = new EtudiantCvDTO();
            cvDTO.setName("cv_jean_dupont.pdf");
            cvDTO.setType("application/pdf");
            cvDTO.setSize(1024L);
            cvDTO.setStatus("APPROVED");
            cvDTO.setData("dGVzdCBkYXRh"); // Base64 pour "test data"

            PostulationDTO postulationDTO = new PostulationDTO();
            postulationDTO.setEtudiant(etudiantDTO);
            postulationDTO.setStage(stageDTO);
            postulationDTO.setCv(cvDTO);
            postulationDTO.setMotivationLetter("bGV0dHJlIGRlIG1vdGl2YXRpb24="); // Base64
            postulationDTO.setDecision(null);
            postulationDTO.setStatus(OfferStatus.SOUMISE);

            return postulationDTO;
        }
    }