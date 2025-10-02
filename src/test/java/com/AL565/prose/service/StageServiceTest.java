package com.AL565.prose.service;

import com.AL565.prose.model.Employeur;
import com.AL565.prose.model.Stage;
import com.AL565.prose.repository.StageRepository;
import com.AL565.prose.service.dto.StageDTO;
import com.AL565.prose.service.dto.StageEnregistrerDTO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StageServiceTest {

    @Mock
    private StageRepository repo;

    @InjectMocks
    private StageService service;

    @Test
    void createStage_retourneDTO_avecIdEtStatusSoumise_et_persiste() {

        var dto = new StageEnregistrerDTO();
        dto.setTitle("Stagiare Java");
        var employeur = new Employeur();
        employeur.setId(7L);

        when(repo.save(any(Stage.class))).thenAnswer(inv -> {
            Stage s = inv.getArgument(0);
            s.setId(42L);
            return s;
        });


        StageDTO out = service.createStage(employeur, dto);


        assertThat(out.getId()).isEqualTo(42L);
        assertThat(out.getStatus().name()).isEqualTo("SOUMISE");
        verify(repo, times(1)).save(any(Stage.class));
    }

    @Test
    void createStage_throw_illegalArgument_siEmployeurNull() {

        var dto = new StageEnregistrerDTO();
        dto.setTitle("Offre");


        Throwable t = catchThrowable(() -> service.createStage(null, dto));


        assertThat(t)
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("employeur");
        verifyNoInteractions(repo);
    }

    @Test
    void createStage_throw_illegalArgument_siDtoNull() {

        var employeur = new Employeur();
        employeur.setId(7L);


        Throwable t = catchThrowable(() -> service.createStage(employeur, null));

        assertThat(t)
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("dto");
        verifyNoInteractions(repo);
    }
}
