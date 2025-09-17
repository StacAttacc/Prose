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
    public Long saveCv(MultipartFile cv, String lastModified) {
        if (cv == null || cv.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fichier manquant");
        }

        String contentType = cv.getContentType();
        if (contentType == null || !MediaType.APPLICATION_PDF_VALUE.equalsIgnoreCase(contentType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Il faut un fichier PDF");
        }

        byte[] data;
        try {
            data = cv.getBytes();
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lecture du fichier échoué", e);
        }

        CV entity = CV.builder()
                .name(cv.getOriginalFilename())
                .type(contentType)
                .size(cv.getSize())
                .lastModified(lastModified)
                .lastModifiedDate(Instant.now())
                .data(data)
                .build();

        return repository.save(entity).getId();
    }

    @Transactional(readOnly = true)
    public CV getCvOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "CV not found"));
    }
}
