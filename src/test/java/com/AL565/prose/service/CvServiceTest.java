package com.AL565.prose.service;

import com.AL565.prose.service.dto.EtudiantCvDTO;
import com.AL565.prose.model.CV;
import com.AL565.prose.model.Etudiant;
import com.AL565.prose.repository.EtudiantRepository;
import com.AL565.prose.repository.CvRepository;
import com.AL565.prose.security.exceptions.CvExceptions;
import com.AL565.prose.service.dto.GestionnaireCvDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CvServiceTest {

    private CvRepository cvRepository;
    private EtudiantRepository etudiantRepository;
    private CvService cvService;
    private MultipartFile file;

    @BeforeEach
    void setUp() {
        cvRepository = mock(CvRepository.class);
        etudiantRepository = mock(EtudiantRepository.class);
        cvService = new CvService(cvRepository, etudiantRepository);
        file = mock(MultipartFile.class);
    }

    @Test
    void saveCv_shouldThrowIfFileIsNull() {
        Exception ex = assertThrows(CvExceptions.NoFileException.class,
                () -> cvService.saveCv(null, "email@email.email", "2024-06-01"));
        assertEquals("Aucun fichier fourni", ex.getMessage());
    }

    @Test
    void saveCv_shouldThrowIfFileIsEmpty() {
        when(file.isEmpty()).thenReturn(true);
        Exception ex = assertThrows(CvExceptions.NoFileException.class,
                () -> cvService.saveCv(file, "email@email.email", "2024-06-01"));
        assertEquals("Aucun fichier fourni", ex.getMessage());
    }

    @Test
    void saveCv_shouldThrowIfNotPdf() {
        when(file.isEmpty()).thenReturn(false);
        when(file.getContentType()).thenReturn(MediaType.IMAGE_JPEG_VALUE);
        Exception ex = assertThrows(CvExceptions.IncorrectFileException.class,
                () -> cvService.saveCv(file, "email@email.email", "2024-06-01"));
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

        cvService.saveCv(file, "email@email.email", "2024-06-01");

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
        CV cv = CV.builder()
                .name("cv.pdf")
                .data(new byte[]{1, 2, 3})
                .build();
        when(cvRepository.findByEtudiant_Credentials_Username("email@email.email")).thenReturn(Optional.of(cv));
        EtudiantCvDTO result = cvService.getCvOrThrow("email@email.email");
        assertEquals("cv.pdf", result.getName());
    }

    @Test
    void getCvOrThrow_shouldThrowIfNotFound() {
        when(cvRepository.findByEtudiant_Credentials_Username("email@email.email")).thenReturn(Optional.empty());
        assertThrows(CvExceptions.StudentNotFoundException.class,
                () -> cvService.getCvOrThrow("email@email.email"));
    }

    @Test
    void getPendingCvs_ShouldReturnMappedDTOs() throws Exception {
        CV cv1 = CV.builder()
                .id(1L)
                .name("CV1")
                .etudiant(new com.AL565.prose.model.Etudiant())
                .approvedAt(null)
                .rejectedAt(null)
                .build();

        CV cv2 = CV.builder()
                .id(2L)
                .name("CV2")
                .etudiant(new com.AL565.prose.model.Etudiant())
                .approvedAt(null)
                .rejectedAt(null)
                .build();

        when(cvRepository.findCVSByApprovedAtIsNullAndRejectedAtIsNull()).thenReturn(Arrays.asList(cv1, cv2));

        List<GestionnaireCvDTO> result = cvService.getPendingCvs();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getApprovedAt()).isNull();
        assertThat(result.get(0).getRejectedAt()).isNull();
        assertThat(result.get(1).getApprovedAt()).isNull();
        assertThat(result.get(1).getRejectedAt()).isNull();
        verify(cvRepository).findCVSByApprovedAtIsNullAndRejectedAtIsNull();
    }



    @Test
    void approveCv_ShouldValidApproveCv() throws Exception {
        Long cvId = 1L;
        CV cv = CV.builder()
                .id(cvId)
                .etudiant(new Etudiant())
                .approvedAt(null)
                .rejectedAt(null)
                .build();

        when(cvRepository.findById(cvId)).thenReturn(Optional.of(cv));
        when(cvRepository.save(any(CV.class))).thenReturn(cv);

        cvService.approveCv(cvId);

        verify(cvRepository).findById(cvId);
        verify(cvRepository).save(cv);
        assertThat(cv.getApprovedAt()).isNotNull();
        assertThat(cv.getRejectedAt()).isNull();
    }

    @Test
    void approveCv_ShouldThrowException_WhenCvNotFound() {
        Long cvId = 99L;
        when(cvRepository.findById(cvId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> cvService.approveCv(cvId))
                .isInstanceOf(CvExceptions.CvNotFoundException.class);

        verify(cvRepository).findById(cvId);
        verify(cvRepository, never()).save(any());
    }



    @Test
    void rejectCv_ShouldRejectCv() throws Exception {
        Long cvId = 2L;
        CV cv = CV.builder()
                .id(cvId)
                .etudiant(new Etudiant())
                .approvedAt(null)
                .rejectedAt(null)
                .build();

        when(cvRepository.findById(cvId)).thenReturn(Optional.of(cv));
        when(cvRepository.save(any(CV.class))).thenReturn(cv);

        cvService.rejectCv(cvId);

        verify(cvRepository).findById(cvId);
        verify(cvRepository).save(cv);
        assertThat(cv.getRejectedAt()).isNotNull();
        assertThat(cv.getApprovedAt()).isNull();
    }

    @Test
    void rejectCv_ShouldThrowException_WhenCvNotFound() {
        Long cvId = 99L;
        when(cvRepository.findById(cvId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> cvService.rejectCv(cvId))
                .isInstanceOf(CvExceptions.CvNotFoundException.class);

        verify(cvRepository).findById(cvId);
        verify(cvRepository, never()).save(any());
    }

}