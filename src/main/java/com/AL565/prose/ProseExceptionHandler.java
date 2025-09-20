package com.AL565.prose;

import com.AL565.prose.service.exception.CvExceptions.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class ProseExceptionHandler {

    @ExceptionHandler(NoFileException.class)
    public ResponseEntity<String> handleNoFileException(NoFileException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Aucun fichier fourni");
    }

    @ExceptionHandler(IncorrectFileException.class)
    public ResponseEntity<String> handleIncorrectFileException(IncorrectFileException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Type de fichier incorrect. Seuls les PDF sont acceptés");
    }

    @ExceptionHandler(FileReadingException.class)
    public ResponseEntity<String> handleFileReadingException(FileReadingException e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur lors de la lecture du fichier");
    }

    @ExceptionHandler(StudentNotFoundException.class)
    public ResponseEntity<String> handleStudentNotFoundException(StudentNotFoundException e) {
        System.out.println("Handling StudentNotFoundException: " + e.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Étudiant non trouvé");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGeneralException(Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur interne du serveur");
    }
}
