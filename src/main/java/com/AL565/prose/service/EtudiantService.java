package com.AL565.prose.service;

import com.AL565.prose.model.CV;
import com.AL565.prose.model.CvStatus;
import com.AL565.prose.model.Etudiant;
import com.AL565.prose.repository.CvRepository;
import com.AL565.prose.repository.EtudiantRepository;
import com.AL565.prose.repository.ProseUserRepository;
import com.AL565.prose.security.exceptions.CvExceptions;
import com.AL565.prose.service.dto.EtudiantCvDTO;
import com.AL565.prose.service.dto.EtudiantDTO;
import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;

@Service
@Transactional
public class EtudiantService {

    private final EtudiantRepository etudiantRepository;
    private final ProseUserRepository proseUserRepository;
    private final CvRepository cvRepository;
    private final PasswordEncoder passwordEncoder;

    public EtudiantService(EtudiantRepository etudiantRepository,
                           ProseUserRepository proseUserRepository,
                           PasswordEncoder passwordEncoder,
                           CvRepository cvRepository) {
        this.cvRepository = cvRepository;
        this.etudiantRepository = etudiantRepository;
        this.proseUserRepository = proseUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void inscrireEtudiant(EtudiantDTO dto) {
        if (proseUserRepository.findByCredentials_Username(dto.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Un compte avec cet email existe déjà");
        }

        Etudiant etudiant = dto.toModel(passwordEncoder);

        etudiantRepository.save(etudiant);
    }

    public void saveCv(MultipartFile cv, String email, String lastModified) throws Exception {
        if (cv == null || cv.isEmpty()) {
            throw new CvExceptions.NoFileException();
        }

        if (cv.getContentType() == null || !MediaType.APPLICATION_PDF_VALUE.equalsIgnoreCase(cv.getContentType())) {
            throw new CvExceptions.IncorrectFileException();
        }

        byte[] data;
        try {
            data = cv.getBytes();
        } catch (IOException e) {
            throw new CvExceptions.FileReadingException();
        }

        Etudiant etudiant = etudiantRepository.findEtudiantByCredentials_Username(email)
                .orElseThrow(CvExceptions.StudentNotFoundException::new);

        CV newCv = CV.builder()
                .name(cv.getOriginalFilename())
                .type(cv.getContentType())
                .size(cv.getSize())
                .lastModified(lastModified)
                .lastModifiedDate(Instant.now())
                .data(data)
                .etudiant(etudiant)
                .status(CvStatus.PENDING)
                .comment(null)
                .build();

        cvRepository.findByEtudiant_Credentials_Username(email)
                .map(existingCv -> {
                    existingCv.setName(newCv.getName());
                    existingCv.setType(newCv.getType());
                    existingCv.setSize(newCv.getSize());
                    existingCv.setLastModified(newCv.getLastModified());
                    existingCv.setLastModifiedDate(newCv.getLastModifiedDate());
                    existingCv.setData(newCv.getData());
                    existingCv.setStatus(CvStatus.PENDING);
                    existingCv.setComment(newCv.getComment());
                    return cvRepository.save(existingCv);
                })
                .orElseGet(() -> cvRepository.save(newCv));
    }

    public EtudiantCvDTO getCvOrThrow(String username) throws CvExceptions.StudentNotFoundException {
        return cvRepository.findByEtudiant_Credentials_Username(username)
                .map(EtudiantCvDTO::toDto)
                .orElseThrow(CvExceptions.StudentNotFoundException::new);
    }
}
