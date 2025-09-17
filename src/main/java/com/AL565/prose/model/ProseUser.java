package com.AL565.prose.model;

import com.AL565.prose.model.auth.Credentials;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

@Entity
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
public abstract class ProseUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String firstName;
    private String lastName;

    @Embedded
    @Column()
    private Credentials credentials;

    public ProseUser(String firstName, String lastName, Credentials credentials) {
        this.id = null;
        this.firstName = firstName;
        this.lastName = lastName;
        this.credentials = credentials;
    }

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
