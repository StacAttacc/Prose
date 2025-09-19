package com.AL565.prose.service;

import com.AL565.prose.dto.EtudiantCvDto;
import com.AL565.prose.model.CV;
import com.AL565.prose.model.Etudiant;
import com.AL565.prose.repository.EtudiantRepository;
import com.AL565.prose.repository.ProseCvRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

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
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.saveCv(null, 1L, "2024-06-01"));
        assertEquals("Fichier manquant", ex.getReason());
    }

    @Test
    void saveCv_shouldThrowIfFileIsEmpty() {
        when(file.isEmpty()).thenReturn(true);
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.saveCv(file, 1L, "2024-06-01"));
        assertEquals("Fichier manquant", ex.getReason());
    }

    @Test
    void saveCv_shouldThrowIfNotPdf() {
        when(file.isEmpty()).thenReturn(false);
        when(file.getContentType()).thenReturn(MediaType.IMAGE_JPEG_VALUE);
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.saveCv(file, 1L, "2024-06-01"));
        assertEquals("Il faut un fichier PDF", ex.getReason());
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
    void getCvOrThrow_shouldReturnCv() {
        CV cv = CV.builder().name("cv.pdf").build();
        when(cvRepository.findByEtudiant_Id(1L)).thenReturn(Optional.of(cv));
        EtudiantCvDto result = service.getCvOrThrow(1L);
        assertEquals("cv.pdf", result.getName());
    }

    @Test
    void getCvOrThrow_shouldThrowIfNotFound() {
        when(cvRepository.findByEtudiant_Id(1L)).thenReturn(Optional.empty());
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.getCvOrThrow(1L));
        assertEquals("CV not found", ex.getReason());
    }
}