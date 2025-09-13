package com.AL565.prose.web;

import com.AL565.prose.model.ProseCV;
import com.AL565.prose.repository.ProseCvRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CvController {

    private final ProseCvRepository repository;

    @PostMapping("/upload-cv")
    public ResponseEntity<Long> upload(@RequestParam("cv") MultipartFile cv,
                                       @RequestParam(value = "lastModified", required = false) String lastModified) throws Exception {
        ProseCV entity = ProseCV.builder()
                .name(cv.getOriginalFilename())
                .type(cv.getContentType() != null ? cv.getContentType() : MediaType.APPLICATION_PDF_VALUE)
                .size(cv.getSize())
                .lastModified(lastModified)
                .lastModifiedDate(Instant.now())
                .data(cv.getBytes())
                .build();

        ProseCV saved = repository.save(entity);
        return ResponseEntity.ok(saved.getId());
    }

    @GetMapping("/cv/{id}")
    public ResponseEntity<byte[]> download(@PathVariable Long id) {
        ProseCV cv = repository.findById(id).orElseThrow();
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(cv.getType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + cv.getName() + "\"")
                .body(cv.getData());
    }
}