package com.AL565.prose.service;

import com.AL565.prose.model.CvStatus;
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
        when(file.getOriginalFilename()).thenReturn("cv.pdf");
        when(file.getSize()).thenReturn(123L);

        when(etudiantRepository.findEtudiantByCredentials_Username("email@email.email"))
                .thenReturn(Optional.of(mock(Etudiant.class)));

        when(cvRepository.save(any(CV.class))).thenAnswer(invocation -> invocation.getArgument(0));

        etudiantService.saveCv(file, "email@email.email", "2024-06-01");

        ArgumentCaptor<CV> captor = ArgumentCaptor.forClass(CV.class);
        verify(cvRepository).save(captor.capture());
        CV saved = captor.getValue();
        assertEquals("cv.pdf", saved.getName());
        assertEquals(MediaType.APPLICATION_PDF_VALUE, saved.getType());
        assertEquals(123L, saved.getSize());
        assertArrayEquals(new byte[]{1, 2, 3}, saved.getData());
        assertEquals("2024-06-01", saved.getLastModified());
    }


    @Test
    void getCvByEmail_shouldReturnCv() throws CvExceptions.StudentNotFoundException {
        CV cv = CV.builder()
                .name("cv.pdf")
                .data(new byte[]{1, 2, 3})
                .status(CvStatus.PENDING)
                .build();
        when(cvRepository.findByEtudiant_Credentials_Username("email@email.email")).thenReturn(Optional.of(cv));
        Optional<EtudiantCvDTO> result = etudiantService.getCvByEmail("email@email.email");
        assertEquals("cv.pdf", result.get().getName());
    }
}
