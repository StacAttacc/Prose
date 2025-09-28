package com.AL565.prose.service;

import com.AL565.prose.service.dto.EtudiantCvDTO;
import com.AL565.prose.model.CV;
import com.AL565.prose.model.Etudiant;
import com.AL565.prose.repository.EtudiantRepository;
import com.AL565.prose.repository.CvRepository;
import com.AL565.prose.security.exceptions.CvExceptions.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;

@Service
@RequiredArgsConstructor
@Transactional
public class CvService {

    private final CvRepository cvRepository;

    private final EtudiantRepository etudiantRepository;

    public void saveCv(MultipartFile cv, String email, String lastModified) throws Exception {
        if (cv == null || cv.isEmpty()) {
            throw new NoFileException();
        }

        if (cv.getContentType() == null || !MediaType.APPLICATION_PDF_VALUE.equalsIgnoreCase(cv.getContentType())) {
            throw new IncorrectFileException();
        }

        byte[] data;
        try {
            data = cv.getBytes();
        } catch (IOException e) {
            throw new FileReadingException();
        }

        Etudiant etudiant = etudiantRepository.findEtudiantByCredentials_Username(email)
                .orElseThrow(StudentNotFoundException::new);

        CV newCv = CV.builder()
                .name(cv.getOriginalFilename())
                .type(cv.getContentType())
                .size(cv.getSize())
                .lastModified(lastModified)
                .lastModifiedDate(Instant.now())
                .data(data)
                .etudiant(etudiant)
                .approvedAt(null)
                .build();

        cvRepository.findByEtudiant_Credentials_Username(email)
                .map(existingCv -> {
                    existingCv.setName(newCv.getName());
                    existingCv.setType(newCv.getType());
                    existingCv.setSize(newCv.getSize());
                    existingCv.setLastModified(newCv.getLastModified());
                    existingCv.setLastModifiedDate(newCv.getLastModifiedDate());
                    existingCv.setData(newCv.getData());
                    existingCv.setApprovedAt(newCv.getApprovedAt());
                    return cvRepository.save(existingCv);
                })
                .orElseGet(() -> cvRepository.save(newCv));
    }

    public EtudiantCvDTO getCvOrThrow(String username) throws StudentNotFoundException {
        CV entity = cvRepository.findByEtudiant_Credentials_Username(username)
                .orElseThrow(StudentNotFoundException::new);

        return new EtudiantCvDTO() {{
            setName(entity.getName());
            setType(entity.getType());
            setSize(entity.getSize());
            setLastModified(entity.getLastModified());
            setLastModifiedDate(entity.getLastModifiedDate());
            setData(entity.getData());
        }};
    }
}
