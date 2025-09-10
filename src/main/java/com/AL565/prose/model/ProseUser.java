package com.AL565.prose.model;

import com.AL565.prose.model.auth.Credentials;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

@Entity
@Getter @Setter
public abstract class ProseUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String firstName;
    private String lastName;

    @Embedded
    private Credentials credentials;

    public String getEmail() {
        return credentials.getUsername();
    }

    public String getPassword() {
        return credentials.getPassword();
    }

    public Collection<? extends GrantedAuthority> getAuthorities(){
        return credentials.getAuthorities();
    }
}
