package com.AL565.prose.service.exception;

public class CvExceptions {
    public static class NoFileException extends Exception {
        public NoFileException() {
            super("Aucun fichier fourni");
        }

        public NoFileException(String message) {
            super(message);
        }
    }

    public static class IncorrectFileException extends Exception {
        public IncorrectFileException() {
            super("Type de fichier incorrect");
        }

        public IncorrectFileException(String message) {
            super(message);
        }
    }

    public static class FileReadingException extends Exception {
        public FileReadingException() {
            super("Erreur lors de la lecture du fichier");
        }

        public FileReadingException(String message) {
            super(message);
        }
    }

    public static class StudentNotFoundException extends Exception {
        public StudentNotFoundException() {
            super("Étudiant non trouvé");
        }

        public StudentNotFoundException(String message) {
            super(message);
        }
    }
}