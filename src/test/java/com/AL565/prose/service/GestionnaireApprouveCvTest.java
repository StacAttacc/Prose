package com.AL565.prose.service;

import com.AL565.prose.repository.ProseCvRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
public class GestionnaireApprouveCvTest {

    @Mock
    private ProseCvRepository proseCvRepository;

    @Mock
    private ProseCvService proseCvService;



    @Test
    void getAllCv_ShouldReturnAllCv() {
        // Test implementation goes here
    }

    @Test
    void getAllPendingApprovalCv_ShouldReturnPendingCv() {
        // Test implementation goes here
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
