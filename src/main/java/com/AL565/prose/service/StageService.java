package com.AL565.prose.service;

import com.AL565.prose.model.Employeur;
import com.AL565.prose.model.Stage;
import com.AL565.prose.repository.StageRepository;
import com.AL565.prose.service.dto.StageEnregistrerDTO;
import com.AL565.prose.service.dto.StageDTO;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StageService {

    private static final Logger log = LoggerFactory.getLogger(StageService.class);
    private final StageRepository repo;

    @Transactional
    public StageDTO createStage(Employeur employeur, StageEnregistrerDTO dto) {
        if (employeur == null) {
            throw new IllegalArgumentException("employeur est obligatoire");
        }
        if (dto == null) {
            throw new IllegalArgumentException("dto est obligatoire");
        }

        Stage toSave = StageEnregistrerDTO.toModel(dto, employeur);
        Stage saved = repo.save(toSave);

        if (saved == null) {

            throw new IllegalStateException("Le repository a renvoyé null après save()");
        }

        log.info(" Offre créée: id={}, titre='{}', employeurId={}",
                saved.getId(), saved.getTitle(), employeur.getId());

        return StageDTO.toDTO(saved);
    }
}
