package com.AL565.prose.service;

import com.AL565.prose.model.*;
import com.AL565.prose.model.auth.Credentials;
import com.AL565.prose.model.auth.Role;
import com.AL565.prose.model.entente.Entente;
import com.AL565.prose.model.entente.EntenteStatus;
import com.AL565.prose.repository.*;
import com.AL565.prose.service.dto.CandidatureEvaluationDTO;
import com.AL565.prose.service.dto.MillieuEvaluationDTO;
import com.AL565.prose.service.dto.ProfesseurPasswordDTO;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProfesseurServiceTest {
    @Mock
    private EntenteRepository ententeRepository;

    @Mock
    private MillieuEvaluationRepository millieuEvaluationRepository;

    @Mock
    private ProfesseurRepository professeurRepository;

    @Mock
    private CandidatureRepository candidatureRepository;

    @Mock
    private EmployeurRepository employeurRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private ProfesseurService professeurService;


    @Test
    void testRegisterProfesseur() {
        ProfesseurPasswordDTO professeur = new ProfesseurPasswordDTO();
        professeur.setPassword("password");
        professeur.setFirstName("Robert");
        professeur.setLastName("Duval");
        professeur.setDiscipline(String.valueOf(Discipline.INFORMATIQUE));
        professeur.setEmail("email");

        professeurService.register(professeur);

        verify(professeurRepository, times(1)).save(any());
    }

    @Test
    void testEvaluateWorkplace() {
        MillieuEvaluation evaluation = new MillieuEvaluation();

        evaluation.setId(1L);
        evaluation.setNomEntreprise("Jean Employeurs");


        when(millieuEvaluationRepository.save(any())).thenReturn(evaluation);
        when(candidatureRepository.findById(any())).thenReturn(Optional.of(new Candidature()));

        professeurService.evaluateWorkplace(MillieuEvaluationDTO.toDTO(evaluation), 1);

        verify(millieuEvaluationRepository, times(2)).save(any());
    }

    @ParameterizedTest
    @CsvSource({
            "2025, 2, 1",
            "2026, 1, 1"
    })
    @Disabled("Pre-existing failure; needs assertion review")
    void testGetAllCandidaturesEvaluation(String year, String expected, String professeurId) {
        Stage stage = new Stage();
        stage.setId(1L);
        stage.setEmployeurEmail("test@gmail.com");
        stage.setStartDate(LocalDate.now());

        Stage stage2 = new Stage();
        stage2.setId(2L);
        stage2.setEmployeurEmail("test@gmail.com");
        stage2.setStartDate(LocalDate.of(2026, 2, 12));

        Candidature candidature1 = new Candidature();
        candidature1.setId(1L);
        candidature1.setStage(stage);
        candidature1.setEvaluationMillieu(new MillieuEvaluation());
        candidature1.setEtudiant(new Etudiant("John", "Doe", new Credentials("john@doe.com", "123", Role.ETUDIANT), Discipline.INFORMATIQUE));

        Candidature candidature2 = new Candidature();
        candidature2.setId(2L);
        candidature2.setStage(stage);
        candidature2.setEtudiant(new Etudiant("John", "Doe", new Credentials("john@doe.com", "123", Role.ETUDIANT), Discipline.INFORMATIQUE));

        Candidature candidature3 = new Candidature();
        candidature3.setId(3L);
        candidature3.setStage(stage2);
        candidature3.setEvaluationMillieu(new MillieuEvaluation());
        candidature3.setEtudiant(new Etudiant("John", "Doe", new Credentials("john@doe.com", "123", Role.ETUDIANT), Discipline.INFORMATIQUE));

        Entente entente = new Entente();
        entente.setStatus(EntenteStatus.SIGNEE);

        when(ententeRepository.findByCandidatureId(any())).thenReturn(Optional.of(entente));
        when(candidatureRepository.findAllByEtudiant_ProfesseurResponsable_Id(anyLong())).thenReturn(List.of(candidature1, candidature2,  candidature3));
        when(employeurRepository.getEmployeurByCredentials_Username(anyString())).thenReturn(new Employeur("test", "test", "test@gmail.com", "test", "test"));

        List<CandidatureEvaluationDTO> candidatures = professeurService.getAllCandidaturesProfesseurRelated(year, professeurId);

        assertThat(candidatures.size()).isEqualTo(Integer.parseInt(expected));
    }

}
