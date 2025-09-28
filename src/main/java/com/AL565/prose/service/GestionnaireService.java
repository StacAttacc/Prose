package com.AL565.prose.service;

import com.AL565.prose.repository.ProseCvRepository;
import com.AL565.prose.security.exceptions.CvExceptions.*;
import com.AL565.prose.service.dto.GestionnaireCvDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class GestionnaireService {

    private final ProseCvRepository proseCvRepository;

    public List<GestionnaireCvDTO> getNonApprovedCvs() throws Exception {
        try {
            return proseCvRepository.findCVSByApprovedAtIsNull()
                    .stream()
                    .map(GestionnaireCvDTO::toDto)
                    .toList();
        } catch (Exception e) {
            throw new FailedToFetchUnapprovedCvsException();
        }
    }
}
