package com.AL565.prose.security;

import com.AL565.prose.model.ProseUser;
import com.AL565.prose.repository.ProseUserRepository;
import com.AL565.prose.security.exceptions.AuthenticationException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class AuthProvider implements AuthenticationProvider {
    private static final String DUMMY_BCRYPT_HASH = "$2a$10$7EqJtq98hPqEX7fNZaFWoOhi5xKqvKkOdPJlfwL0XlMVYUO0Hvy/u";

    private final PasswordEncoder passwordEncoder;
    private final ProseUserRepository proseUserRepository;

    @Override
    public Authentication authenticate(Authentication authentication) {
        String email = authentication.getPrincipal().toString();
        String submittedPassword = authentication.getCredentials().toString();
        Optional<ProseUser> userOpt = proseUserRepository.findByCredentials_Username(email);

        if (userOpt.isEmpty()) {
            passwordEncoder.matches(submittedPassword, DUMMY_BCRYPT_HASH);
            throw new AuthenticationException(HttpStatus.FORBIDDEN, "Incorrect username or password");
        }

        ProseUser user = userOpt.get();
        if (!passwordEncoder.matches(submittedPassword, user.getPassword())) {
            throw new AuthenticationException(HttpStatus.FORBIDDEN, "Incorrect username or password");
        }

        return new UsernamePasswordAuthenticationToken(
                user.getEmail(),
                user.getPassword(),
                user.getAuthorities()
        );
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication);
    }
}
