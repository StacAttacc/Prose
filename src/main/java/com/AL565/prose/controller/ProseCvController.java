package com.AL565.prose.controller;

import com.AL565.prose.model.ProseCV;
import com.AL565.prose.service.ProseCvService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ProseCvController {

    private final ProseCvService cvService;

    @PostMapping("/upload-cv")
    public ResponseEntity<Long> upload(@RequestParam("cv") MultipartFile cv,
                                       @RequestParam(value = "lastModified", required = false) String lastModified) {
        Long id = cvService.saveCv(cv, lastModified);
        return ResponseEntity.ok(id);
    }

    @GetMapping("/cv/{id}")
    public ResponseEntity<byte[]> download(@PathVariable Long id) {
        ProseCV cv = cvService.getCvOrThrow(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(cv.getType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + cv.getName() + "\"")
                .body(cv.getData());
    }

    // TODO: involve user ownership/authorization in CvService
}