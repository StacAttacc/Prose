package com.AL565.prose.service;

import com.AL565.prose.repository.CvRepository;
import com.AL565.prose.repository.GestionnaireRepository;
import com.AL565.prose.security.exceptions.CvExceptions.*;
import com.AL565.prose.service.dto.GestionnaireCvDTO;
import com.AL565.prose.service.dto.GestionnaireDTO;
import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class GestionnaireService {

    private final CvRepository cvRepository;

    private final GestionnaireRepository gestionnaireRepository;
    private final PasswordEncoder passwordEncoder;

    public void saveGestionnaire(GestionnaireDTO gestionnaire) {
        try {
            gestionnaireRepository.save(gestionnaire.toModel(passwordEncoder));
        } catch (Exception e) {
            throw new EmailAlreadyExistsException("Un compte avec cet email existe déjà");
        }
    }

    public List<GestionnaireCvDTO> getPendingCvs() throws Exception {
        try {
            return cvRepository.findCVSByApprovedAtIsNullAndRejectedAtIsNull()
                    .stream()
                    .map(GestionnaireCvDTO::toDto)
                    .toList();
        } catch (Exception e) {
            System.out.println(e.getMessage());
            throw new FailedToFetchUnapprovedCvsException();
        }
    }

    public void approveCv(Long cvId) throws Exception {
        cvRepository.findById(cvId).map(cv -> {
            cv.setApprovedAt(new Date());
            cv.setRejectedAt(null);
            return cvRepository.save(cv);
        }).orElseThrow(CvNotFoundException::new);
    }

    public void rejectCv(Long cvId) throws Exception {
        cvRepository.findById(cvId).map(cv -> {
            cv.setRejectedAt(new Date());
            cv.setApprovedAt(null);
            return cvRepository.save(cv);
        }).orElseThrow(CvNotFoundException::new);
    }
}
