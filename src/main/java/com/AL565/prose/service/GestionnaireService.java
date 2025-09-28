package com.AL565.prose.service;

import com.AL565.prose.repository.CvRepository;
import com.AL565.prose.security.exceptions.CvExceptions.*;
import com.AL565.prose.service.dto.GestionnaireCvDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class GestionnaireService {

    private final CvRepository cvRepository;

    public List<GestionnaireCvDTO> getPendingCvs() throws Exception {
        try {
            return cvRepository.findCVSByApprovedAtIsNullAndRejectedAtIsNull()
                    .stream()
                    .map(GestionnaireCvDTO::toDto)
                    .toList();
        } catch (Exception e) {
            throw new FailedToFetchUnapprovedCvsException();
        }
    }

    public void approveCv(Long cvId) throws Exception {
        cvRepository.findById(cvId).map(cv -> {
            cv.setApprovedAt(new Date());
            cv.setRejectedAt(null);
            return cvRepository.save(cv);
        }).orElseThrow(FailedToFetchCV::new);
    }

    public void rejectCv(Long cvId) throws Exception {
        cvRepository.findById(cvId).map(cv -> {
            cv.setRejectedAt(new Date());
            cv.setApprovedAt(null);
            return cvRepository.save(cv);
        }).orElseThrow(FailedToFetchCV::new);
    }
}
