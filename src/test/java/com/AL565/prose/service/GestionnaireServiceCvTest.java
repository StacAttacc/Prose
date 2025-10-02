package com.AL565.prose.service;

import com.AL565.prose.model.CV;
import com.AL565.prose.model.auth.Credentials;
import com.AL565.prose.repository.CvRepository;
import com.AL565.prose.repository.GestionnaireRepository;
import com.AL565.prose.service.dto.GestionnaireCvDTO;
import com.AL565.prose.model.Etudiant;
import com.AL565.prose.security.exceptions.CvExceptions;
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
public class GestionnaireServiceCvTest {

    @Mock
    private CvRepository cvRepository;

    @Mock
    private GestionnaireRepository gestionnaireRepository;

    @InjectMocks
    private GestionnaireService gestionnaireService;

    @Test
    void getPendingCvs_ShouldReturnMappedDTOs() throws Exception {
        Etudiant etudiant1 = new Etudiant();
        etudiant1.setFirstName("John");
        etudiant1.setLastName("Doe");
        etudiant1.setCredentials(new Credentials());

        Etudiant etudiant2 = new Etudiant();
        etudiant2.setFirstName("Jane");
        etudiant2.setLastName("Smith");
        etudiant2.setCredentials(new Credentials());

        CV cv1 = CV.builder()
                .id(1L)
                .name("CV1")
                .etudiant(etudiant1)
                .approvedAt(null)
                .rejectedAt(null)
                .comment(null)
                .data(new byte[]{1, 2, 3})
                .build();

        CV cv2 = CV.builder()
                .id(2L)
                .name("CV2")
                .etudiant(etudiant2)
                .approvedAt(null)
                .rejectedAt(null)
                .comment(null)
                .data(new byte[]{1, 2, 3})
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

        gestionnaireService.approveCv(cvId, "Looks good");

        verify(cvRepository).findById(cvId);
        verify(cvRepository).save(cv);
        assertThat(cv.getApprovedAt()).isNotNull();
        assertThat(cv.getRejectedAt()).isNull();
    }

    @Test
    void approveCv_ShouldThrowException_WhenCvNotFound() {
        Long cvId = 99L;
        when(cvRepository.findById(cvId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> gestionnaireService.approveCv(cvId, "Looks good"))
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

        gestionnaireService.rejectCv(cvId, "Not suitable");

        verify(cvRepository).findById(cvId);
        verify(cvRepository).save(cv);
        assertThat(cv.getRejectedAt()).isNotNull();
        assertThat(cv.getApprovedAt()).isNull();
    }

    @Test
    void rejectCv_ShouldThrowException_WhenCvNotFound() {
        Long cvId = 99L;
        when(cvRepository.findById(cvId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> gestionnaireService.rejectCv(cvId, "Not suitable"))
                .isInstanceOf(CvExceptions.CvNotFoundException.class);

        verify(cvRepository).findById(cvId);
        verify(cvRepository, never()).save(any());
    }
}
