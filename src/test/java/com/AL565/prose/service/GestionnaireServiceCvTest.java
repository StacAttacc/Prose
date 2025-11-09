package com.AL565.prose.service;

import com.AL565.prose.model.*;
import com.AL565.prose.model.auth.Credentials;
import com.AL565.prose.repository.CvRepository;
import com.AL565.prose.repository.GestionnaireRepository;
import com.AL565.prose.repository.NotificationRepository;
import com.AL565.prose.service.dto.GestionnaireCvDTO;
import com.AL565.prose.security.exceptions.CvExceptions;
import com.AL565.prose.service.dto.GestionnairePasswordDTO;
import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class GestionnaireServiceCvTest {

    @Mock
    private CvRepository cvRepository;

    @Mock
    private GestionnaireRepository gestionnaireRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private GestionnaireService gestionnaireService;

    @Test
    void saveGestionnaire_shouldSaveWhenEmailNotExists() {
        GestionnairePasswordDTO dto = new GestionnairePasswordDTO();
        dto.setEmail("test@example.com");
        dto.setPassword("plainPassword");

        when(gestionnaireRepository.findByCredentials_Username("test@example.com"))
                .thenReturn(Optional.empty());
        when(passwordEncoder.encode("plainPassword")).thenReturn("encodedPassword");
        when(gestionnaireRepository.save(any(Gestionnaire.class))).thenReturn(new Gestionnaire());

        gestionnaireService.saveGestionnaire(dto);

        verify(passwordEncoder).encode("plainPassword");
        verify(gestionnaireRepository).save(any(Gestionnaire.class));
    }

    @Test
    void saveGestionnaire_shouldThrowWhenEmailExists() {
        GestionnairePasswordDTO dto = new GestionnairePasswordDTO();
        dto.setEmail("test@example.com");

        when(gestionnaireRepository.findByCredentials_Username("test@example.com"))
                .thenReturn(Optional.of(new Gestionnaire()));

        assertThatThrownBy(() -> gestionnaireService.saveGestionnaire(dto))
                .isInstanceOf(EmailAlreadyExistsException.class);

        verify(gestionnaireRepository, never()).save(any());
    }

    @Test
    void getAllCvs_ShouldReturnMappedDTOs() throws Exception {
        Etudiant etudiant1 = new Etudiant();
        etudiant1.setFirstName("John");
        etudiant1.setLastName("Doe");
        etudiant1.setCredentials(new Credentials());
        etudiant1.setDiscipline(Discipline.INFORMATIQUE);


        Etudiant etudiant2 = new Etudiant();
        etudiant2.setFirstName("Jane");
        etudiant2.setLastName("Smith");
        etudiant2.setCredentials(new Credentials());
        etudiant2.setDiscipline(Discipline.INFORMATIQUE);

        CV cv1 = CV.builder()
                .id(1L)
                .name("CV1")
                .etudiant(etudiant1)
                .status(CvStatus.PENDING)
                .comment(null)
                .data(new byte[]{1, 2, 3})
                .lastModifiedDate(Instant.now())
                .build();

        CV cv2 = CV.builder()
                .id(2L)
                .name("CV2")
                .etudiant(etudiant2)
                .status(CvStatus.PENDING)
                .comment(null)
                .data(new byte[]{1, 2, 3})
                .lastModifiedDate(Instant.now())
                .build();


        when(cvRepository.findAll()).thenReturn(Arrays.asList(cv1, cv2));

        List<GestionnaireCvDTO> result = gestionnaireService.getAllCvs(null);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getStatus()).isEqualTo(CvStatus.PENDING.name());
        assertThat(result.get(0).getStatus()).isEqualTo(CvStatus.PENDING.name());
        assertThat(result.get(1).getStatus()).isEqualTo(CvStatus.PENDING.name());
        assertThat(result.get(1).getStatus()).isEqualTo(CvStatus.PENDING.name());
        verify(cvRepository).findAll();
    }

    @Test
    void getAllCvsYearFiltered() throws Exception {
        Etudiant etudiant1 = new Etudiant();
        etudiant1.setFirstName("John");
        etudiant1.setLastName("Doe");
        etudiant1.setCredentials(new Credentials());
        etudiant1.setDiscipline(Discipline.INFORMATIQUE);


        Etudiant etudiant2 = new Etudiant();
        etudiant2.setFirstName("Jane");
        etudiant2.setLastName("Smith");
        etudiant2.setCredentials(new Credentials());
        etudiant2.setDiscipline(Discipline.INFORMATIQUE);

        CV cv1 = CV.builder()
                .id(1L)
                .name("CV1")
                .etudiant(etudiant1)
                .status(CvStatus.PENDING)
                .comment(null)
                .data(new byte[]{1, 2, 3})
                .lastModifiedDate(LocalDateTime.of(2077, 5, 12, 7, 24).toInstant(ZoneOffset.ofHours(3)))
                .build();

        CV cv2 = CV.builder()
                .id(2L)
                .name("CV2")
                .etudiant(etudiant2)
                .status(CvStatus.PENDING)
                .comment(null)
                .data(new byte[]{1, 2, 3})
                .lastModifiedDate(LocalDateTime.of(2077, 5, 18, 12, 57).toInstant(ZoneOffset.ofHours(3)))
                .build();

        CV cv3 = CV.builder()
                .id(3L)
                .name("CV3")
                .etudiant(etudiant2)
                .status(CvStatus.PENDING)
                .comment(null)
                .data(new byte[]{1, 2, 3})
                .lastModifiedDate(LocalDateTime.of(2078, 3, 11, 18, 03).toInstant(ZoneOffset.ofHours(3)))
                .build();


        when(cvRepository.findAll()).thenReturn(Arrays.asList(cv1, cv2, cv3));

        List<GestionnaireCvDTO> result2077 = gestionnaireService.getAllCvs("2077");
        List<GestionnaireCvDTO> result2078 = gestionnaireService.getAllCvs("2078");
        List<GestionnaireCvDTO> result2025 = gestionnaireService.getAllCvs("2025");

        assertThat(result2077).hasSize(2);
        assertThat(result2077.getFirst().getData()).isEqualTo(Base64.getEncoder().encodeToString(cv1.getData()));
        assertThat(result2077.getLast().getData()).isEqualTo(Base64.getEncoder().encodeToString(cv2.getData()));

        assertThat(result2078).hasSize(1);
        assertThat(result2078.getFirst().getData()).isEqualTo(Base64.getEncoder().encodeToString(cv3.getData()));

        assertThat(result2025).hasSize(0);


    }

    @Test
    void approveCv_ShouldValidApproveCv() throws Exception {
        Credentials credentials = new Credentials();
        credentials.setUsername("dummy@email.com");
        credentials.setPassword("password");

        Etudiant etudiant = new Etudiant();
        etudiant.setCredentials(credentials);

        CV cv = CV.builder()
                .id(1L)
                .etudiant(etudiant)
                .status(CvStatus.PENDING)
                .build();

        when(cvRepository.findById(cv.getId())).thenReturn(Optional.of(cv));
        when(cvRepository.save(any(CV.class))).thenReturn(cv);
        when(notificationRepository.save(any())).thenReturn(null);

        gestionnaireService.changeCvStatus(cv.getId(), CvStatus.APPROVED.name(), "Looks good");

        verify(cvRepository).findById(cv.getId());
        verify(cvRepository).save(cv);
        assertThat(cv.getStatus()).isEqualTo(CvStatus.APPROVED);
    }

    @Test
    void approveCv_ShouldThrowException_WhenCvNotFound() {
        Long cvId = 99L;
        when(cvRepository.findById(cvId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> gestionnaireService.changeCvStatus(cvId,CvStatus.APPROVED.name(),"Looks good"))
                .isInstanceOf(CvExceptions.FailedToChangeCvStatusException.class);

        verify(cvRepository).findById(cvId);
        verify(cvRepository, never()).save(any());
    }



    @Test
    void rejectCv_ShouldRejectCv() throws Exception {
        Credentials credentials = new Credentials();
        credentials.setUsername("dummy@email.com");
        credentials.setPassword("password");

        Etudiant etudiant = new Etudiant();
        etudiant.setCredentials(credentials);

        CV cv = CV.builder()
                .id(2L)
                .etudiant(etudiant)
                .status(CvStatus.PENDING)
                .build();

        when(cvRepository.findById(cv.getId())).thenReturn(Optional.of(cv));
        when(cvRepository.save(any(CV.class))).thenReturn(cv);
        when(notificationRepository.save(any())).thenReturn(null);

        gestionnaireService.changeCvStatus(cv.getId(), CvStatus.REJECTED.name() ,"Not suitable");

        verify(cvRepository).findById(cv.getId());
        verify(cvRepository).save(cv);
        assertThat(cv.getStatus()).isEqualTo(CvStatus.REJECTED);
    }

    @Test
    void rejectCv_ShouldThrowException_WhenCvNotFound() {
        Long cvId = 99L;
        when(cvRepository.findById(cvId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> gestionnaireService.changeCvStatus(cvId, CvStatus.REJECTED.name(), "Not suitable"))
                .isInstanceOf(CvExceptions.FailedToChangeCvStatusException.class);

        verify(cvRepository).findById(cvId);
        verify(cvRepository, never()).save(any());
    }
}
