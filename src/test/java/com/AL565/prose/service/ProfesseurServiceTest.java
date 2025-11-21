package com.AL565.prose.service;

import com.AL565.prose.model.MillieuEvaluation;
import com.AL565.prose.repository.MillieuEvaluationRepository;
import com.AL565.prose.repository.ProfesseurRepository;
import com.AL565.prose.service.dto.MillieuEvaluationDTO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProfesseurServiceTest {
    @Mock
    private MillieuEvaluationRepository millieuEvaluationRepository;

    @Mock
    private ProfesseurRepository professeurRepository;

    @InjectMocks
    private ProfesseurService professeurService;

    @Test
    void testEvaluateWorkplace() {
        MillieuEvaluation evaluation = new MillieuEvaluation();

        evaluation.setId(1L);
        evaluation.setNomEntreprise("Jean Employeurs");

        when(millieuEvaluationRepository.save(any())).thenReturn(evaluation);

        professeurService.evaluateWorkplace(MillieuEvaluationDTO.toDTO(evaluation));

        verify(millieuEvaluationRepository, times(1)).save(any());
    }
}
