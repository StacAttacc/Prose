package com.AL565.prose.service;

import com.AL565.prose.service.dto.EtudiantCvDto;
import com.AL565.prose.model.CV;
import com.AL565.prose.model.Etudiant;
import com.AL565.prose.repository.EtudiantRepository;
import com.AL565.prose.repository.ProseCvRepository;
import com.AL565.prose.security.exceptions.CvExceptions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EtudiantCvServiceTest {

    private ProseCvRepository cvRepository;
    private EtudiantRepository etudiantRepository;
    private ProseCvService service;
    private MultipartFile file;

    @BeforeEach
    void setUp() {
        cvRepository = mock(ProseCvRepository.class);
        etudiantRepository = mock(EtudiantRepository.class);
        service = new ProseCvService(cvRepository, etudiantRepository);
        file = mock(MultipartFile.class);
    }

    @Test
    void saveCv_shouldThrowIfFileIsNull() {
        Exception ex = assertThrows(CvExceptions.NoFileException.class,
                () -> service.saveCv(null, 1L, "2024-06-01"));
        assertEquals("Aucun fichier fourni", ex.getMessage());
    }

    @Test
    void saveCv_shouldThrowIfFileIsEmpty() {
        when(file.isEmpty()).thenReturn(true);
        Exception ex = assertThrows(CvExceptions.NoFileException.class,
                () -> service.saveCv(file, 1L, "2024-06-01"));
        assertEquals("Aucun fichier fourni", ex.getMessage());
    }

    @Test
    void saveCv_shouldThrowIfNotPdf() {
        when(file.isEmpty()).thenReturn(false);
        when(file.getContentType()).thenReturn(MediaType.IMAGE_JPEG_VALUE);
        Exception ex = assertThrows(CvExceptions.IncorrectFileException.class,
                () -> service.saveCv(file, 1L, "2024-06-01"));
        assertEquals("Il faut un fichier PDF valide", ex.getMessage());
    }

    @Test
    void saveCv_shouldSaveValidPdf() throws Exception {
        when(file.isEmpty()).thenReturn(false);
        when(file.getContentType()).thenReturn(MediaType.APPLICATION_PDF_VALUE);
        when(file.getBytes()).thenReturn(new byte[]{1, 2, 3});
        when(file.getOriginalFilename()).thenReturn("cv.pdf");
        when(file.getSize()).thenReturn(123L);
        when(etudiantRepository.findById(1L)).thenReturn(Optional.of(mock(Etudiant.class)));

        service.saveCv(file, 1L, "2024-06-01");

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
    void getCvOrThrow_shouldReturnCv() throws CvExceptions.StudentNotFoundException {
        CV cv = CV.builder().name("cv.pdf").build();
        when(cvRepository.findByEtudiant_Id(1L)).thenReturn(Optional.of(cv));
        EtudiantCvDto result = service.getCvOrThrow(1L);
        assertEquals("cv.pdf", result.getName());
    }

    @Test
    void getCvOrThrow_shouldThrowIfNotFound() {
        when(cvRepository.findByEtudiant_Id(1L)).thenReturn(Optional.empty());
        assertThrows(CvExceptions.StudentNotFoundException.class,
                () -> service.getCvOrThrow(1L));
    }

}