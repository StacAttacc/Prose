package com.AL565.prose.service;

import com.AL565.prose.dto.EtudiantCvDto;
import com.AL565.prose.model.CV;
import com.AL565.prose.model.Etudiant;
import com.AL565.prose.repository.EtudiantRepository;
import com.AL565.prose.repository.ProseCvRepository;
import com.AL565.prose.service.exception.CvExceptions.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class ProseCvService {

    private final ProseCvRepository cvRepository;

    private final EtudiantRepository etudiantRepository;

    @Transactional
    public EtudiantCvDto saveCv(MultipartFile cv, Long idEtudiant, String lastModified) throws IOException {
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

        Etudiant etudiant = etudiantRepository.findById(idEtudiant)
                .orElseThrow(StudentNotFoundException::new);

        CV entity = CV.builder()
                .name(cv.getOriginalFilename())
                .type(cv.getContentType())
                .size(cv.getSize())
                .lastModified(lastModified)
                .lastModifiedDate(Instant.now())
                .data(data)
                .etudiant(etudiant)
                .build();

        cvRepository.save(entity);

        return new EtudiantCvDto() {{
            setName(entity.getName());
            setType(entity.getType());
            setSize(entity.getSize());
            setLastModified(entity.getLastModified());
            setLastModifiedDate(entity.getLastModifiedDate());
            setData(entity.getData());
        }};
    }

    @Transactional(readOnly = true)
    public EtudiantCvDto getCvOrThrow(Long id) {
        CV entity = cvRepository.findByEtudiant_Id(id)
                .orElseThrow(StudentNotFoundException::new);

        return new EtudiantCvDto() {{
            setName(entity.getName());
            setType(entity.getType());
            setSize(entity.getSize());
            setLastModified(entity.getLastModified());
            setLastModifiedDate(entity.getLastModifiedDate());
            setData(entity.getData());
        }};
    }
}
