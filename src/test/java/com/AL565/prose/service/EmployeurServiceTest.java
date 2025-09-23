package com.AL565.prose.service;

import com.AL565.prose.model.Employeur;
import com.AL565.prose.repository.EmployeurRepository;
import com.AL565.prose.repository.ProseUserRepository;
import com.AL565.prose.service.dto.EmployeurDTO;
import com.AL565.prose.service.dto.EmployeurEnregistrerDTO;
import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

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

    @InjectMocks
    private EmployeurService employeurService;

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
}