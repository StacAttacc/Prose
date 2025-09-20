package com.AL565.prose.security.exception;

public class CvExceptions {
    public static class NoFileException extends Exception {
        public NoFileException() {
            super("Aucun fichier fourni");
        }
    }

    public static class IncorrectFileException extends Exception {
        public IncorrectFileException() {
            super("Il faut un fichier PDF valide");
        }
    }

    public static class FileReadingException extends Exception {
        public FileReadingException() {
            super("Erreur lors de la lecture du fichier");
        }
    }

    public static class StudentNotFoundException extends Exception {
        public StudentNotFoundException() {
            super("Étudiant non trouvé");
        }
    }
}