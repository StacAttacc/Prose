package com.AL565.prose.service;

import com.AL565.prose.model.Employeur;
import com.AL565.prose.model.Etudiant;
import com.AL565.prose.model.OfferStatus;
import com.AL565.prose.repository.EmployeurRepository;
import com.AL565.prose.model.CV;
import com.AL565.prose.model.CvStatus;
import com.AL565.prose.model.Candidature;
import com.AL565.prose.repository.CvRepository;
import com.AL565.prose.repository.EtudiantRepository;
import com.AL565.prose.repository.CandidatureRepository;
import com.AL565.prose.repository.ProseUserRepository;
import com.AL565.prose.repository.StageRepository;
import com.AL565.prose.service.dto.EtudiantPasswordDTO;
import com.AL565.prose.service.dto.CandidatureDTO;
import com.AL565.prose.service.dto.StageDTO;
import com.AL565.prose.service.dto.EtudiantCandidatureDTO;

import java.util.List;
import java.util.stream.Collectors;

import com.AL565.prose.security.exceptions.CvExceptions;
import com.AL565.prose.service.dto.EtudiantCvDTO;
import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.Optional;

@Service
@Transactional
@AllArgsConstructor
public class EtudiantService {

    private final EtudiantRepository etudiantRepository;
    private final ProseUserRepository proseUserRepository;
    private final CvRepository cvRepository;
    private final PasswordEncoder passwordEncoder;
    private final StageRepository stageRepository;
    private final EmployeurRepository employeurRepository;
    private final CandidatureRepository candidatureRepository;

    public void inscrireEtudiant(EtudiantPasswordDTO dto) {
        if (proseUserRepository.findByCredentials_Username(dto.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Un compte avec cet email existe déjà");
        }

        dto.setPassword(passwordEncoder.encode(dto.getPassword()));

        Etudiant etudiant = EtudiantPasswordDTO.toModel(dto);

        etudiantRepository.save(etudiant);
    }

    public List<StageDTO> getEtudiantStages(String token) {
        return stageRepository.findByStatus(OfferStatus.APPROUVEE)
                .stream()
                .map(stage -> {
                    Employeur employeur = employeurRepository.getEmployeurByCredentials_Username(stage.getEmployeurEmail());
                    return StageDTO.fromModel(stage, employeur);
                })
                .collect(Collectors.toList());
    }
  
    public void saveCv(MultipartFile cv, String email, String lastModified) throws Exception {
        if (cv == null || cv.isEmpty()) {
            throw new CvExceptions.NoFileException();
        }

        if (cv.getContentType() == null || !MediaType.APPLICATION_PDF_VALUE.equalsIgnoreCase(cv.getContentType())) {
            throw new CvExceptions.IncorrectFileException();
        }

        byte[] data;
        try {
            data = cv.getBytes();
        } catch (IOException e) {
            throw new CvExceptions.FileReadingException();
        }

        Etudiant etudiant = etudiantRepository.findEtudiantByCredentials_Username(email)
                .orElseThrow(CvExceptions.StudentNotFoundException::new);

        CV newCv = CV.builder()
                .name(cv.getOriginalFilename())
                .type(cv.getContentType())
                .size(cv.getSize())
                .lastModified(lastModified)
                .lastModifiedDate(Instant.now())
                .data(data)
                .etudiant(etudiant)
                .status(CvStatus.PENDING)
                .comment(null)
                .build();

        cvRepository.findByEtudiant_Credentials_Username(email)
                .map(existingCv -> {
                    existingCv.setName(newCv.getName());
                    existingCv.setType(newCv.getType());
                    existingCv.setSize(newCv.getSize());
                    existingCv.setLastModified(newCv.getLastModified());
                    existingCv.setLastModifiedDate(newCv.getLastModifiedDate());
                    existingCv.setData(newCv.getData());
                    existingCv.setStatus(CvStatus.PENDING);
                    existingCv.setComment(newCv.getComment());
                    return cvRepository.save(existingCv);
                })
                .orElseGet(() -> cvRepository.save(newCv));
    }

    public Optional<EtudiantCvDTO> getByEmail(String username) {
        return cvRepository.findByEtudiant_Credentials_Username(username)
                .map(EtudiantCvDTO::toDto);
    }


    public boolean hasApprovedCv(String email) {
        return cvRepository.findByEtudiant_Credentials_Username(email)
                .map(cv -> cv.getStatus() == CvStatus.APPROVED)
                .orElse(false);
    }

    public void createCandidature(CandidatureDTO candidatureDTO) throws Exception {
        // Validation du DTO
        if (candidatureDTO == null) {
            throw new IllegalArgumentException("Les données de candidature sont requises");
        }

        if (candidatureDTO.getStageId() == null) {
            throw new IllegalArgumentException("L'ID du stage est requis");
        }

        if (candidatureDTO.getEtudiantEmail() == null || candidatureDTO.getEtudiantEmail().isEmpty()) {
            throw new IllegalArgumentException("L'email de l'étudiant est requis");
        }

        // Vérifier si l'étudiant a déjà postulé à ce stage
        if (candidatureRepository.existsByEtudiant_Credentials_UsernameAndStage_Id(
                candidatureDTO.getEtudiantEmail(), candidatureDTO.getStageId())) {
            throw new Exception("Vous avez déjà postulé à ce stage");
        }

        // Vérifier le fichier de lettre de motivation (optionnel, mais si fourni doit être PDF)
        if (candidatureDTO.getMotivationLetterData() != null && candidatureDTO.getMotivationLetterData().length > 0) {
            if (candidatureDTO.getMotivationLetterContentType() == null ||
                !MediaType.APPLICATION_PDF_VALUE.equalsIgnoreCase(candidatureDTO.getMotivationLetterContentType())) {
                throw new Exception("La lettre de motivation doit être au format PDF");
            }
        }

        // Récupérer l'étudiant
        Etudiant etudiant = etudiantRepository.findEtudiantByCredentials_Username(candidatureDTO.getEtudiantEmail())
                .orElseThrow(() -> new Exception("Étudiant non trouvé"));

        // Récupérer le CV approuvé
        CV cv = cvRepository.findByEtudiant_Credentials_Username(candidatureDTO.getEtudiantEmail())
                .orElseThrow(() -> new Exception("CV non trouvé"));

        if (cv.getStatus() != CvStatus.APPROVED) {
            throw new Exception("Le CV n'est pas approuvé");
        }

        // Récupérer le stage
        var stage = stageRepository.findById(candidatureDTO.getStageId())
                .orElseThrow(() -> new Exception("Stage non trouvé"));

        Candidature candidature = candidatureDTO.toModel(etudiant, cv, stage);

        candidatureRepository.save(candidature);
    }

    public boolean hasAlreadyApplied(String email, Long stageId) {
        return candidatureRepository.existsByEtudiant_Credentials_UsernameAndStage_Id(email, stageId);
    }

    public List<EtudiantCandidatureDTO> getMesCandidatures(String email) {
        List<Candidature> candidatures = candidatureRepository.findByEtudiant_Credentials_Username(email);

        return candidatures.stream()
                .map(candidature -> {
                    String employeurEmail = candidature.getStage().getEmployeurEmail();
                    Employeur employeur = employeurRepository.getEmployeurByCredentials_Username(employeurEmail);
                    return EtudiantCandidatureDTO.toDTO(candidature, employeur);
                })
                .collect(Collectors.toList());
    }
}
