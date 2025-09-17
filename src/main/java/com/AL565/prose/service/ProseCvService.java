package com.AL565.prose.service;

import com.AL565.prose.model.CV;
import com.AL565.prose.repository.ProseCvRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class ProseCvService {

    private final ProseCvRepository repository;

    @Transactional
    public void saveCv(MultipartFile cv, Long idEtudiant, String lastModified) {
        if (cv == null || cv.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fichier manquant");
        }

        if (cv.getContentType() == null || !MediaType.APPLICATION_PDF_VALUE.equalsIgnoreCase(cv.getContentType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Il faut un fichier PDF");
        }

        byte[] data;
        try {
            data = cv.getBytes();
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lecture du fichier échoué", e);
        }

        //TODO: get user and confirm it's the one you want to save the CV for

        CV entity = CV.builder()
                .name(cv.getOriginalFilename())
                .type(cv.getContentType())
                .size(cv.getSize())
                .lastModified(lastModified)
                .lastModifiedDate(Instant.now())
                .data(data)
        //TODO: add etudiant to this cv
                .build();

        repository.save(entity);
    }

    @Transactional(readOnly = true)
    public CV getCvOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "CV not found"));
    }
}
