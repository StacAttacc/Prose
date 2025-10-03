package com.AL565.prose.security.exceptions;

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

    public static class FailedToFetchUnapprovedCvsException extends Exception {
        public FailedToFetchUnapprovedCvsException() {
            super("Échec de la récupération des CVs non approuvés");
        }
    }

    public static class CvNotFoundException extends Exception {
        public CvNotFoundException() {
            super("Échec de la récupération du CV");
        }
    }

    public static class FailedToApproveCvException extends Exception {
        public FailedToApproveCvException() {
            super("Échec de l'approbation du CV");
        }
    }

    public static class FailedToRejectCvException extends Exception {
        public FailedToRejectCvException() {
            super("Échec du rejet du CV");
        }
    }
}