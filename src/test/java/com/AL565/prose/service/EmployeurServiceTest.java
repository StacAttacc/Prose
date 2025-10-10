package com.AL565.prose.service;

import com.AL565.prose.model.Employeur;
import com.AL565.prose.model.Stage;
import com.AL565.prose.repository.EmployeurRepository;
import com.AL565.prose.repository.NotificationRepository;
import com.AL565.prose.repository.ProseUserRepository;
import com.AL565.prose.repository.StageRepository;
import com.AL565.prose.service.dto.EmployeurDTO;
import com.AL565.prose.service.dto.EmployeurPasswordDTO;
import com.AL565.prose.service.dto.StageDTO;
import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeurServiceTest {

    @Mock
    private ProseUserRepository proseUserRepository;

    @Mock
    private EmployeurRepository employeurRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private StageRepository stageRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private EmployeurService employeurService;

    @Test
    void enregistrer() throws EmailAlreadyExistsException {
        Employeur employeur = new Employeur("Justin", "Trudeau", "Gouvernement du Canada", "jt@gov.ca", "gouvernement");
        EmployeurPasswordDTO justin = new EmployeurPasswordDTO(employeur);

        employeurService.enregistrer(justin);

        verify(employeurRepository, times(1)).save(any());
    }

    @Test
    void getEmployeur() {
        Employeur mark = new Employeur("Mark", "Carney", "Gouvernement du Canada", "mc@gov.ca", "gouvernement");
        mark.setId(1L);

        when(proseUserRepository.findByCredentials_Username("mc@gov.ca")).thenReturn(Optional.of(mark));

        EmployeurDTO markDTO = employeurService.getEmployeur("mc@gov.ca");

        assertEquals(1L, markDTO.getId());
    }


    @Test
    void createStage() throws Exception {
        Employeur employeur = new Employeur(8L, "Umberto", "Macaco", "Zac inc", "email");
        EmployeurDTO empDto = new EmployeurDTO(employeur, null);


        var dto = StageDTO.builder()
                .title("Stagiaire Java")
                .description("Développer des APIs Spring")
                .requirements("Java, Spring, SQL")
                .skills(List.of("Java", "Spring"))
                .startDate(LocalDate.now().plusDays(7))
                .endDate(LocalDate.now().plusWeeks(12))
                .location("Montréal")
                .workMode("HYBRIDE")
                .compensation("22$/h")
                .employeur(empDto)
                .build();

        when(stageRepository.save(any(Stage.class))).thenAnswer(inv -> {
            Stage s = inv.getArgument(0);
            s.setId(42L);
            return s;
        });

        when(employeurRepository.getEmployeurByCredentials_Username(any(String.class))).thenReturn(employeur);
        when(notificationRepository.save(any())).thenReturn(null);

        StageDTO out = employeurService.createStage(dto);

        assertThat(out.getId()).isEqualTo(42L);
        assertThat(out.getStatus().name()).isEqualTo("SOUMISE");
        verify(stageRepository, times(1)).save(any(Stage.class));
    }

    @Test
    void createStage_throw_illegalArgument_siDtoNull() {
        var employeur = new Employeur();
        employeur.setId(7L);

        assertThatThrownBy(() -> employeurService.createStage(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("dto");

        verifyNoInteractions(stageRepository);
    }


}