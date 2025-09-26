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
        Stage saved = repo.save(StageEnregistrerDTO.toModel(dto, employeur));

        log.info("✅ Offre créée: id={}, titre='{}', employeurId={}, email={}",
                saved.getId(), saved.getTitle(), employeur.getId(), employeur.getEmail());

        return StageDTO.toDTO(saved);
    }
}
