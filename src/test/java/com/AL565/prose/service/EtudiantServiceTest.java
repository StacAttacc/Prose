package com.AL565.prose.service;

    import com.AL565.prose.model.Discipline;
    import com.AL565.prose.model.Etudiant;
    import com.AL565.prose.repository.EtudiantRepository;
    import com.AL565.prose.repository.ProseUserRepository;
    import com.AL565.prose.service.dto.EtudiantDTO;
    import com.AL565.prose.service.dto.EtudiantPasswordDTO;
    import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;
    import org.junit.jupiter.api.Test;
    import org.junit.jupiter.api.extension.ExtendWith;
    import org.mockito.InjectMocks;
    import org.mockito.Mock;
    import org.mockito.junit.jupiter.MockitoExtension;
    import org.springframework.security.crypto.password.PasswordEncoder;

    import java.util.Optional;

    import static org.mockito.ArgumentMatchers.any;
    import static org.mockito.Mockito.*;

    @ExtendWith(MockitoExtension.class)
    class EtudiantServiceTest {

        @Mock
        private ProseUserRepository proseUserRepository;

        @Mock
        private EtudiantRepository etudiantRepository;

        @Mock
        private PasswordEncoder passwordEncoder;

        @InjectMocks
        private EtudiantService etudiantService;

        @Test
        void inscrireEtudiant() throws EmailAlreadyExistsException {
            EtudiantPasswordDTO etudiantDTO = new EtudiantPasswordDTO();
            etudiantDTO.setFirstName("Jean");
            etudiantDTO.setLastName("Dupont");
            etudiantDTO.setEmail("jean.dupont@etudiant.ca");
            etudiantDTO.setPassword("motdepasse");
            etudiantDTO.setDiscipline(String.valueOf(Discipline.INFORMATIQUE));

            when(passwordEncoder.encode(anyString())).thenReturn("motdepasseEncode");
            when(proseUserRepository.findByCredentials_Username(anyString())).thenReturn(Optional.empty());

            etudiantService.inscrireEtudiant(etudiantDTO);

            verify(etudiantRepository, times(1)).save(any(Etudiant.class));
        }
    }