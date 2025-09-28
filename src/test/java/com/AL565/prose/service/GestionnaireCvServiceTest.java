package com.AL565.prose.service;

import com.AL565.prose.model.CV;
import com.AL565.prose.model.Etudiant;
import com.AL565.prose.repository.CvRepository;
import com.AL565.prose.security.exceptions.CvExceptions;
import com.AL565.prose.service.dto.GestionnaireCvDTO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class GestionnaireCvServiceTest {

    @Mock
    private CvRepository cvRepository;

    @InjectMocks
    private GestionnaireService gestionnaireService;

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

        List<GestionnaireCvDTO> result = gestionnaireService.getPendingCvs();

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

        gestionnaireService.approveCv(cvId);

        verify(cvRepository).findById(cvId);
        verify(cvRepository).save(cv);
        assertThat(cv.getApprovedAt()).isNotNull();
        assertThat(cv.getRejectedAt()).isNull();
    }

    @Test
    void approveCv_ShouldThrowException_WhenCvNotFound() {
        Long cvId = 99L;
        when(cvRepository.findById(cvId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> gestionnaireService.approveCv(cvId))
                .isInstanceOf(CvExceptions.FailedToFetchCV.class);

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

        gestionnaireService.rejectCv(cvId);

        verify(cvRepository).findById(cvId);
        verify(cvRepository).save(cv);
        assertThat(cv.getRejectedAt()).isNotNull();
        assertThat(cv.getApprovedAt()).isNull();
    }

    @Test
    void rejectCv_ShouldThrowException_WhenCvNotFound() {
        Long cvId = 99L;
        when(cvRepository.findById(cvId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> gestionnaireService.rejectCv(cvId))
                .isInstanceOf(CvExceptions.FailedToFetchCV.class);

        verify(cvRepository).findById(cvId);
        verify(cvRepository, never()).save(any());
    }
}
