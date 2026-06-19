package com.AL565.prose.security;

import com.AL565.prose.model.auth.Role;
import com.AL565.prose.repository.ProseUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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

import static org.springframework.http.HttpMethod.*;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Enables @PreAuthorize, @PostAuthorize, etc.
@RequiredArgsConstructor
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
                        .requestMatchers("/actuator/health/**").permitAll()
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
                        .anyRequest().authenticated()
                )
                .headers(headers -> headers.frameOptions(Customizer.withDefaults()).disable())
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

        configuration.setAllowedOriginPatterns(List.of(
                "http://localhost:5173",
                "http://localhost:5130",
                "https://*.vercel.app"
        ));

        configuration.setAllowedMethods(Arrays.asList(
                HttpMethod.GET.name(),
                HttpMethod.POST.name(),
                HttpMethod.PUT.name(),
                HttpMethod.DELETE.name(),
                HttpMethod.OPTIONS.name()
        ));

        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Cache-Control",
                "Content-Type",
                "Accept",
                "X-Requested-With"
        ));

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
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