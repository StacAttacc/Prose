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
}
