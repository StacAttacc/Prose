package com.AL565.prose.security;

import com.AL565.prose.model.auth.Role;
import com.AL565.prose.repository.ProseUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.List;

import static org.springframework.boot.autoconfigure.security.servlet.PathRequest.toH2Console;
import static org.springframework.http.HttpMethod.*;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Enables @PreAuthorize, @PostAuthorize, etc.
@RequiredArgsConstructor
//@Profile("!test")
public class SecurityConfiguration {

    private final JwtTokenProvider jwtTokenProvider;
    private final ProseUserRepository userRepository;
    private final JwtAuthenticationEntryPoint authenticationEntryPoint;

    private static final String USER_LOGIN_PATH = "/user/login";
    private static final String ETUDIANT_REGISTER_PATH = "/etudiant/register";
    private static final String EMPLOYEUR_REGISTER_PATH = "/employeur/register";
    private static final String PROFESSEUR_REGISTER_PATH = "/professeur/register";
    private static final String USER_PATH = "/user/**";
    private static final String ETUDIANT_PATH = "/etudiant/**";
    private static final String EMPLOYEUR_PATH = "/employeur/**";
    private static final String GESTIONNAIRE_PATH = "/gestionnaire/**";
    private static final String PROFESSEUR_PATH = "/professeur/**";

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(POST, USER_LOGIN_PATH).permitAll()
                        .requestMatchers(POST, ETUDIANT_REGISTER_PATH).permitAll()
                        .requestMatchers(POST, EMPLOYEUR_REGISTER_PATH).permitAll()
                        .requestMatchers(POST, PROFESSEUR_REGISTER_PATH).permitAll()


                        .requestMatchers(HttpMethod.GET, "/etudiant/telecharger-cv/**")
                        .hasAnyAuthority(Role.EMPLOYEUR.name(), Role.ETUDIANT.name())


                        // Use Role enum names for authorities
                        .requestMatchers(GET, USER_PATH).hasAnyAuthority(Role.ETUDIANT.name(), Role.EMPLOYEUR.name(), Role.GESTIONNAIRE.name())
                        .requestMatchers(ETUDIANT_PATH).hasAuthority(Role.ETUDIANT.name())
                        .requestMatchers(EMPLOYEUR_PATH).hasAuthority(Role.EMPLOYEUR.name())
                        .requestMatchers(PROFESSEUR_PATH).hasAuthority(Role.PROFESSEUR.name())
                        .requestMatchers(GESTIONNAIRE_PATH).hasAuthority(Role.GESTIONNAIRE.name())
                        .anyRequest().authenticated() // Changed from denyAll() to authenticated() - more common, adjust if denyAll is strictly needed
                )
                .headers(headers -> headers.frameOptions(Customizer.withDefaults()).disable()) // for h2-console
                .sessionManagement((secuManagement) -> {
                    secuManagement.sessionCreationPolicy(SessionCreationPolicy.STATELESS);
                })
                .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)
                .exceptionHandling(configurer -> configurer.authenticationEntryPoint(authenticationEntryPoint));

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 1. Specify allowed origins (VERY IMPORTANT!)
        //    Must match your React app's URL exactly (e.g., http://localhost:3000)
        //    Do NOT use "*" if you need credentials (like sending Authorization headers)
        configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:5130")); // Adjust if your frontend runs elsewhere

        // 2. Specify allowed HTTP methods
        configuration.setAllowedMethods(Arrays.asList(
                HttpMethod.GET.name(),
                HttpMethod.POST.name(),
                HttpMethod.PUT.name(),
                HttpMethod.DELETE.name(),
                HttpMethod.OPTIONS.name() // Crucial for preflight requests
        ));

        // 3. Specify allowed headers
        //    Include standard headers and importantly "Authorization" for JWT,
        //    and "Content-Type". Add any other custom headers your frontend sends.
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Cache-Control",
                "Content-Type",
                "Accept",
                "X-Requested-With"// Add any other headers needed by your frontend
        ));

        // 4. Allow credentials (cookies, Authorization headers)
        //    Required if your frontend sends credentials.
        configuration.setAllowCredentials(true);

        // 5. (Optional) Specify exposed headers
        //    If your frontend needs to read headers from the response (e.g., a custom header)
        // configuration.setExposedHeaders(List.of("Custom-Header"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Apply this configuration to all paths /**
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    public CorsFilter corsFilter() {
        return new CorsFilter(corsConfigurationSource());
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtTokenProvider, userRepository);
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authenticationConfiguration
    ) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}