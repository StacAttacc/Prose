package com.AL565.prose.service;

import com.AL565.prose.model.Employeur;
import com.AL565.prose.model.Stage;
import com.AL565.prose.repository.EmployeurRepository;
import com.AL565.prose.repository.ProseUserRepository;
import com.AL565.prose.repository.StageRepository;
import com.AL565.prose.service.dto.EmployeurDTO;
import com.AL565.prose.service.dto.EmployeurEnregistrerDTO;
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

    @InjectMocks
    private EmployeurService employeurService;



    private Stage makeStage(String email, String title) {
        Stage s = new Stage();
        s.setTitle(title);
        s.setDescription("desc");
        s.setRequirements("reqs");
        s.setSkills(List.of("Java", "Spring"));
        s.setStartDate(LocalDate.now().plusDays(7));
        s.setEndDate(LocalDate.now().plusWeeks(12));
        s.setLocation("Montréal");
        s.setWorkMode("HYBRIDE");
        s.setCompensation("22$/h");
        s.setEmployeurEmail(email);
        return s;
    }

    private Employeur makeEmployeur(long id, String email, String first, String last, String company) {
        Employeur e = new Employeur();
        e.setId(id);
        e.setFirstName(first);
        e.setLastName(last);
        e.setCompany(company);
        var creds = new com.AL565.prose.model.auth.Credentials();
        creds.setUsername(email); // ProseUser.getEmail() lit credentials.username
        e.setCredentials(creds);
        return e;
    }


    @Test
    void enregistrer() throws EmailAlreadyExistsException {
        EmployeurEnregistrerDTO justin = new EmployeurEnregistrerDTO("Justin", "Trudeau", "Gouvernement du Canada", "jt@gov.ca", "gouvernement");

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
    void createStage_retourneDTO_avecId_et_statusSoumise_et_persiste() {
        String email = "email";

        var employeur = new Employeur();
        employeur.setId(8L);
        employeur.setFirstName("Umberto");
        employeur.setLastName("Macaco");
        employeur.setCompany("Zac inc");

        var creds = new com.AL565.prose.model.auth.Credentials();
        creds.setUsername(email);                 // clé: ProseUser.getEmail() lit credentials.username
        employeur.setCredentials(creds);          // évite le NPE

        when(employeurRepository.getEmployeurByCredentials_Username(email))
                .thenReturn(employeur);

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
                .employeur(new EmployeurDTO(
                        8, "Umberto", "Macaco", "Zac inc", email
                ))
                .build();

        when(stageRepository.save(any(Stage.class))).thenAnswer(inv -> {
            Stage s = inv.getArgument(0);
            s.setId(42L); // simulate DB generated id
            return s;
        });

        StageDTO out = employeurService.createStage(dto);

        assertThat(out.getId()).isEqualTo(42L);
        assertThat(out.getStatus().name()).isEqualTo("SOUMISE");
        assertThat(out.getEmployeur().getId()).isEqualTo(8L);
        assertThat(out.getEmployeur().getCompany()).isEqualTo("Zac inc");

        verify(stageRepository, times(1)).save(any(Stage.class));
        verify(employeurRepository, times(1)).getEmployeurByCredentials_Username(email);
    }

    @Test
    void createStage_throw_illegalArgument_siDtoNull() {
        assertThatThrownBy(() -> employeurService.createStage(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("dto");

        verifyNoInteractions(stageRepository);
    }

    @Test
    void listStagesFor_retourneDTOs_mappes() {
        String email = "boss@zac-inc.com";
        var stages = List.of(
                makeStage(email, "Stage A"),
                makeStage(email, "Stage B")
        );

        when(stageRepository.findByEmployeurEmail(email)).thenReturn(stages);
        when(employeurRepository.getEmployeurByCredentials_Username(email))
                .thenReturn(makeEmployeur(8L, email, "Umberto", "Macaco", "Zac inc"));

        List<StageDTO> result = employeurService.listStagesFor(email);

        assertEquals(2, result.size());
        assertThat(result.get(0).getTitle()).isEqualTo("Stage A");
        assertThat(result.get(1).getTitle()).isEqualTo("Stage B");

        verify(stageRepository).findByEmployeurEmail(email);
        verify(employeurRepository, times(2)).getEmployeurByCredentials_Username(email);
    }

    @Test
    void listStagesFor_retourneListeVide_siAucunStage() {
        String email = "vide@zac-inc.com";
        when(stageRepository.findByEmployeurEmail(email)).thenReturn(List.of());

        List<StageDTO> result = employeurService.listStagesFor(email);

        assertEquals(0, result.size());
        verifyNoInteractions(employeurRepository);
    }

    @Test
    void listStagesFor_mappeCorrectementEmployeurDansDTO() {
        String email = "boss@zac-inc.com";
        var stages = List.of(makeStage(email, "Stage C"));
        var emp = makeEmployeur(99L, email, "Umberto", "Macaco", "Zac inc");

        when(stageRepository.findByEmployeurEmail(email)).thenReturn(stages);
        when(employeurRepository.getEmployeurByCredentials_Username(email)).thenReturn(emp);

        List<StageDTO> result = employeurService.listStagesFor(email);

        assertEquals(1, result.size());
        assertThat(result.get(0).getEmployeur().getId()).isEqualTo(99L);
        assertThat(result.get(0).getEmployeur().getCompany()).isEqualTo("Zac inc");
    }
}
