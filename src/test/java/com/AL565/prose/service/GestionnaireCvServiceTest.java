package com.AL565.prose.service;

import com.AL565.prose.model.CV;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class GestionnaireCvServiceTest {

    @Mock
    private CvRepository cvRepository;

    @Mock
    private CvService cvService;

    @InjectMocks
    private GestionnaireService gestionnaireService;



    @Test
    void getAllCv_ShouldReturnAllCv() {
        // Test implementation goes here
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

        List<GestionnaireCvDTO> result = gestionnaireService.getPendingCvs();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getApprovedAt()).isNull();
        assertThat(result.get(0).getRejectedAt()).isNull();
        assertThat(result.get(1).getApprovedAt()).isNull();
        assertThat(result.get(1).getRejectedAt()).isNull();
        verify(cvRepository).findCVSByApprovedAtIsNullAndRejectedAtIsNull();
    }



    @Test
    void approveCv_ShouldValidApproveCv() {
        // Test implementation goes here
    }

    @Test
    void approveCv_ShouldThrowException_WhenCvNotFound() {
        // Test implementation goes here
    }

    @Test
    void approveCv_ShouldThrowException_WhenCvAlreadyApproved() {
        // Test implementation goes here
    }



    @Test
    void rejectCv_ShouldRejectCv() {
        // Test implementation goes here
    }

    @Test
    void rejectCv_ShouldThrowException_WhenCvNotFound() {

    }

    @Test
    void rejectCv_ShouldThrowException_WhenCvAlreadyRejected() {

    }
}
