package com.AL565.prose.service;

import com.AL565.prose.model.CvStatus;
import com.AL565.prose.model.auth.Credentials;
import com.AL565.prose.model.notifications.NouveauCvNotification;
import com.AL565.prose.model.notifications.Notification;
import com.AL565.prose.repository.NotificationRepository;
import com.AL565.prose.service.dto.EtudiantCvDTO;
import com.AL565.prose.model.CV;
import com.AL565.prose.model.Etudiant;
import com.AL565.prose.repository.EtudiantRepository;
import com.AL565.prose.repository.CvRepository;
import com.AL565.prose.security.exceptions.CvExceptions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EtudiantServiceCvTest {

    @Mock
    private CvRepository cvRepository;

    @Mock
    private EtudiantRepository etudiantRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private EtudiantService etudiantService;

    private MultipartFile file;

    @BeforeEach
    void setUp() {
        file = mock(MultipartFile.class);
    }

    @Test
    void saveCv_shouldThrowIfFileIsNull() {
        Exception ex = assertThrows(CvExceptions.NoFileException.class,
                () -> etudiantService.saveCv(null, "email@email.email", "2024-06-01"));
        assertEquals("Aucun fichier fourni", ex.getMessage());
    }

    @Test
    void saveCv_shouldThrowIfFileIsEmpty() {
        when(file.isEmpty()).thenReturn(true);
        Exception ex = assertThrows(CvExceptions.NoFileException.class,
                () -> etudiantService.saveCv(file, "email@email.email", "2024-06-01"));
        assertEquals("Aucun fichier fourni", ex.getMessage());
    }

    @Test
    void saveCv_shouldThrowIfNotPdf() {
        when(file.isEmpty()).thenReturn(false);
        when(file.getContentType()).thenReturn(MediaType.IMAGE_JPEG_VALUE);
        Exception ex = assertThrows(CvExceptions.IncorrectFileException.class,
                () -> etudiantService.saveCv(file, "email@email.email", "2024-06-01"));
        assertEquals("Il faut un fichier PDF valide", ex.getMessage());
    }

    @Test
    void saveCv_shouldSaveValidPdf() throws Exception {
        when(file.getOriginalFilename()).thenReturn("cv.pdf");
        when(file.isEmpty()).thenReturn(false);
        when(file.getContentType()).thenReturn(MediaType.APPLICATION_PDF_VALUE);
        when(file.getBytes()).thenReturn(new byte[]{1, 2, 3});
        when(file.getSize()).thenReturn(123L);

        Credentials credentials = new Credentials();
        credentials.setUsername("dummy@email.com");
        credentials.setPassword("dummyPassword");
        Etudiant etudiant = new Etudiant();
        etudiant.setFirstName("dummy");
        etudiant.setLastName("dum dum");
        etudiant.setCredentials(credentials);

        CV cv = new CV();
        cv.setEtudiant(etudiant);
        cv.setId(1L);

        NouveauCvNotification gcn = new NouveauCvNotification();
        gcn.setCvId(cv.getId());
        gcn.setId(1L);

        when(etudiantRepository.findEtudiantByCredentials_Username(etudiant.getEmail()))
                .thenReturn(Optional.of(etudiant));

        when(cvRepository.findByEtudiant_Credentials_Username(etudiant.getEmail()))
                .thenReturn(Optional.empty());

        when(cvRepository.save(any(CV.class)))
                .thenReturn(cv)
                .thenAnswer(invocation -> invocation.getArgument(0));

        when(notificationRepository.save(any(Notification.class)))
                .thenReturn(null);

        etudiantService.saveCv(file, etudiant.getEmail(), "2024-06-01");

        ArgumentCaptor<CV> captor = ArgumentCaptor.forClass(CV.class);
        verify(cvRepository).save(captor.capture());
        CV saved = captor.getValue();
        assertEquals("cv.pdf", saved.getName());
        assertEquals(MediaType.APPLICATION_PDF_VALUE, saved.getType());
        assertEquals(123L, saved.getSize());
        assertArrayEquals(new byte[]{1, 2, 3}, saved.getData());
        assertEquals("2024-06-01", saved.getLastModified());

        verify(notificationRepository, times(1)).save(any(Notification.class));
    }



    @Test
    void getCvByEmail_shouldReturnCv() {
        CV cv = CV.builder()
                .name("cv.pdf")
                .data(new byte[]{1, 2, 3})
                .status(CvStatus.PENDING)
                .build();
        when(cvRepository.findByEtudiant_Credentials_Username("email@email.email")).thenReturn(Optional.of(cv));
        EtudiantCvDTO result = etudiantService.getCvByEmail("email@email.email");
        assertEquals("cv.pdf", result.getName());
    }
}
